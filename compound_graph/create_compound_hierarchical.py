import json

# allgraph_objectsのオブジェクトの凡例
#{
#    "group": "nodes",
#    "data": {
#        "id": "Article名",
#        "name": "Article名",
#        "href": "URL",
#        "parent": "Directory名"
#    },
#    "position": {
#        "x": x座標,
#        "y": y座標
#    }
#},

def adjust_directory_positions(allgraph_objects, directories):
    # 移動後の余白
    gap_x = 1000
    gap_y = 800
    # ディレクトリの上下左右端を格納する辞書(ディレクトリid:各端)
    tops = {} # Cytoscape.jsではyが増加すると描画的には下へ向かう
    bottoms = {}
    lefts = {}
    rights = {}

    # 各ディレクトリの領域を取得，格納
    for directory in directories:
        dir_id = directory['id']
        lefts[dir_id], rights[dir_id], tops[dir_id], bottoms[dir_id] = get_area(allgraph_objects, dir_id)

    overlapping_pairs = []

    # 上下に重なったディレクトリ同士を(上id, 下id)となるようにペアを取得
    for directory_i in directories:
        for directory_j in directories:
            if directory_i != directory_j:
                id_i = directory_i['id']
                id_j = directory_j['id']
                if (lefts[id_i] < rights[id_j]) and (lefts[id_j] < rights[id_i]) and \
                    tops[id_i] < tops[id_j] and bottoms[id_i] < bottoms[id_j] and tops[id_j] < bottoms[id_i]:
                        overlapping_pairs.append([id_i, id_j])
    # ペア前者の上端順でソート
    overlapping_pairs.sort(key=lambda x: tops[x[0]])

    # y軸方向への移動
    for pair in overlapping_pairs:
        min_x1, max_x1, min_y1, max_y1 = get_area(allgraph_objects, pair[0])
        min_x2, max_x2, min_y2, max_y2 = get_area(allgraph_objects, pair[1])
        if (min_x1 < max_x2) and (min_x2 < max_x1) and (min_y1 < max_y2) and (min_y2 < max_y1):
            distance = max_y1 - min_y2 + gap_y
            for directory in directories:
                min_x, max_x, min_y, max_y = get_area(allgraph_objects, directory['id'])
                if min_y2 <= min_y:
                    move_directories(allgraph_objects, directory['id'], 'y', distance)

    tops = {}
    bottoms = {}
    lefts = {}
    rights = {}

    for directory in directories:
        dir_id = directory['id']
        lefts[dir_id], rights[dir_id], tops[dir_id], bottoms[dir_id] = get_area(allgraph_objects, dir_id)

    overlapping_pairs = []
    
    # 重なったディレクトリ同士を(左id, 右id)となるようにペアを取得
    for directory_i in directories:
        for directory_j in directories:
            if directory_i != directory_j:
                id_i = directory_i['id']
                id_j = directory_j['id']
                if (lefts[id_i] < rights[id_j]) and (lefts[id_j] < rights[id_i]) and \
                    (tops[id_i] < bottoms[id_j]) and (tops[id_j] < bottoms[id_i]) and \
                    ((lefts[id_i]+rights[id_i])/2) < ((lefts[id_j]+rights[id_j])/2) :
                        overlapping_pairs.append([id_i, id_j])
    overlapping_pairs.sort(key=lambda x: (lefts[x[0]] + rights[x[0]]) / 2)
    
    # x軸方向への移動
    for pair in overlapping_pairs:
        min_x1, max_x1, min_y1, max_y1 = get_area(allgraph_objects, pair[0])
        min_x2, max_x2, min_y2, max_y2 = get_area(allgraph_objects, pair[1])
        if (min_x1 < max_x2) and (min_x2 < max_x1) and (min_y1 < max_y2) and (min_y2 < max_y1) or\
            ((min_x1+max_x1)/2) > ((min_x2+max_x2)/2):
            distance = max_x1 - min_x2 + gap_x
            move_directories(allgraph_objects, pair[1], 'x', distance)

    # 新規の重複を再帰的に除去
    overlap = True
    while overlap:
        overlap = False
        for i in range(len(directories)):
            for j in range(i+1, len(directories)):
                min_x1, max_x1, min_y1, max_y1 = get_area(allgraph_objects, directories[i]['id'])
                min_x2, max_x2, min_y2, max_y2 = get_area(allgraph_objects, directories[j]['id'])
                if (min_x1 < max_x2) and (min_x2 < max_x1) and (min_y1 < max_y2) and (min_y2 < max_y1):
                    overlap = True
                    if (min_x1+max_x1)/2 > (min_x2+max_x2)/2:
                        distance = max_x2 - min_x1 + gap_x
                        allgraph_objects = move_directories(allgraph_objects, directories[i]['id'], 'x', distance)
                    else :
                        distance = max_x1 - min_x2 + gap_x
                        allgraph_objects = move_directories(allgraph_objects, directories[j]['id'], 'x', distance)
    return directories

# 引数directory(string)の領域を求める
def get_area(allgraph_objects, directory):
    max_x = float('-inf')
    min_x = float('inf')
    max_y = float('-inf')
    min_y = float('inf')

    for obj in allgraph_objects['eleObjs']:
        if obj['group'] == 'nodes' and obj['data'].get('parent'):
            if obj['data']['parent'] == "/"+directory:
                # ノードのx座標とy座標を取得
                node_x = obj['position']['x']
                node_y = obj['position']['y']

                # x座標の最大値と最小値を更新
                if node_x > max_x:
                    max_x = node_x
                if node_x < min_x:
                    min_x = node_x

                # y座標の最大値と最小値を更新
                if node_y > max_y:
                    max_y = node_y
                if node_y < min_y:
                    min_y = node_y

    # 最大値と最小値を含むタプルを返す
    return (min_x, max_x, min_y, max_y)

# 引数directory(string)に属するノードをaxis方向(｢'x'｣もしくは｢'y'｣)にdistance(float)だけ動かす
def move_directories(allgraph_objects, directory, axis, distance):
    for obj in allgraph_objects['eleObjs']:
        if obj['group'] == 'nodes' and obj['data'].get('parent'):
            if obj['data']['parent'] == "/"+directory:
                obj['position'][axis] += distance
    
    return allgraph_objects


def graph_adjust(unadjusted_graph, directories, output):
    allGraph_json = open('graph_attrs/'+unadjusted_graph, 'r')
    allgraph_objects = json.load(allGraph_json)
    #directories = [{'id': 'Sets_and_TopologySets', 'x': 54745.29230769233, 'y': 26869.846153846152}, {'id': 'Sets_and_TopologyRelations', 'x': 45449.850000000006, 'y': 20412.0}, {'id': 'Sets_and_TopologyFunctions', 'x': 59652.78000000001, 'y': 25358.4}, {'id': 'Sets_and_TopologyOrdinal_Numbers', 'x': 52305.42857142857, 'y': 26583.428571428572}, {'id': 'Sets_and_TopologyOrder', 'x': 60806.880000000005, 'y': 24300.0}, {'id': 'Math_LogicAxiomatic_Set_Theory', 'x': 52247.165217391295, 'y': 36978.260869565216}, {'id': 'AlgebraRings', 'x': 49055.36347826087, 'y': 36433.565217391304}, {'id': 'Sets_and_TopologyCategories_and_Functors', 'x': 51296.799999999996, 'y': 34578.0}, {'id': 'AlgebraFields', 'x': 54097.151999999995, 'y': 34685.28}, {'id': 'Func_AnFunction_Space', 'x': 55064.25, 'y': 38664.0}, {'id': 'Sets_and_TopologyNumbers', 'x': 56559.321290322594, 'y': 20760.387096774193}, {'id': 'Math_LogicProof_Theory', 'x': 52389.6, 'y': 9180.0}, {'id': 'AlgebraAlgebra', 'x': 45905.100000000006, 'y': 25164.0}, {'id': 'Sets_and_TopologyCardinality', 'x': 65002.1, 'y': 29952.0}, {'id': 'Disc_MathGraph_Theory', 'x': 41976.15000000004, 'y': 38347.71428571428}, {'id': 'Sets_and_TopologyReal_Numbers_and_the_Real_Line', 'x': 54393.600000000006, 'y': 13500.0}, {'id': 'Number_TheoryElementary_Number_Theory', 'x': 65309.64444444446, 'y': 41164.0}, {'id': 'Math_LogicFormal_Systems_and_Proofs', 'x': 49316.85381818183, 'y': 39498.545454545456}, {'id': 'Num_AnNumerical_Analysis', 'x': 50976.600000000006, 'y': 15876.0}, {'id': 'AnalysisAnalysis', 'x': 59445.600000000006, 'y': 19980.0}, {'id': 'AlgebraPolynomials', 'x': 63814.2, 'y': 43153.71428571428}, {'id': 'Disc_MathEnumerative_Combinatorics', 'x': 80149.20000000001, 'y': 35676.0}, {'id': 'Sets_and_TopologyBoolean_Algebra', 'x': 46019.71764705882, 'y': 38454.35294117647}, {'id': 'Sets_and_TopologyConvergence', 'x': 76604.68235294118, 'y': 40182.35294117647}, {'id': 'AnalysisHarmonic_Analysis_Real_Analysis', 'x': 80160.0, 'y': 29052.0}, {'id': 'Complex_AnComplex_Analysis', 'x': 101106.0, 'y': 21276.0}, {'id': 'AnalysisContinuous_Functions', 'x': 58126.04999999999, 'y': 41688.0}, {'id': 'AnalysisDifferential_Calculus', 'x': 84894.08, 'y': 42094.28571428572}, {'id': 'AlgebraAlgebraic_Equations', 'x': 86130.98181818181, 'y': 46528.36363636364}, {'id': 'AnalysisSeries', 'x': 87836.59999999999, 'y': 44172.0}, {'id': 'Complex_AnHolomorphic_Functions', 'x': 72737.2, 'y': 39996.0}, {'id': 'Prob_TheoryProbability_Theory', 'x': 64666.84860000001, 'y': 44323.2}, {'id': 'AnalysisMeasure_Theory', 'x': 89748.87272727274, 'y': 42234.545454545456}, {'id': 'Sets_and_TopologyEquivalence_Relations', 'x': 42201.6, 'y': 22572.0}, {'id': 'Info_MathCoding_Theory', 'x': 38170.032, 'y': 40456.8}, {'id': 'Opt_TheoryCombinatorial_Optimization', 'x': 46569.6, 'y': 28188.000000000004}, {'id': 'AnalysisConvex_Analysis', 'x': 67262.16, 'y': 37260.0}, {'id': 'GeometryTrigonometry', 'x': 94925.23636363636, 'y': 43975.63636363636}, {'id': 'AnalysisElementary_Functions', 'x': 50740.4, 'y': 42444.0}, {'id': 'Info_MathInformation_Theory', 'x': 54707.200000000004, 'y': 38412.0}, {'id': 'AnalysisFourier_Transform', 'x': 109914.0, 'y': 42444.0}, {'id': 'Math_LogicComputable_Functions', 'x': 83825.55918367348, 'y': 46957.95918367347}, {'id': 'Number_TheoryContinued_Fractions', 'x': 47541.600000000006, 'y': 19116.0}, {'id': 'AnalysisIntegration', 'x': 70074.85, 'y': 43668.0}, {'id': 'Sets_and_TopologyLattices', 'x': 54387.96923076923, 'y': 41746.153846153844}, {'id': 'Info_MathCryptography', 'x': 60710.4, 'y': 44064.0}, {'id': 'GeometryFoundations_of_Geometry', 'x': 41130.600000000006, 'y': 26892.0}, {'id': 'Sets_and_TopologyTopological_Spaces', 'x': 42969.69032258069, 'y': 34900.25806451613}, {'id': 'AlgebraVector_Spaces', 'x': 59343.1542857143, 'y': 35593.71428571428}, {'id': 'Groups_and_RepGroup', 'x': 51302.52857142858, 'y': 38648.57142857143}, {'id': 'Sets_and_TopologyStructures', 'x': 50250.479999999996, 'y': 31212.0}, {'id': 'GeometryAffine_Geometry', 'x': 55010.640000000014, 'y': 37778.4}, {'id': 'AlgebraClifford_Algebras', 'x': 48849.600000000006, 'y': 23868.0}, {'id': 'Sets_and_TopologyMetric_Spaces', 'x': 51327.36, 'y': 38383.2}, {'id': 'GeometryProjective_Geometry', 'x': 63641.35384615384, 'y': 41646.46153846154}, {'id': 'AlgebraMatrices', 'x': 56448.771428571425, 'y': 42567.42857142857}, {'id': 'AlgebraModules', 'x': 55311.399999999994, 'y': 43332.0}, {'id': 'AlgebraPolynomial_Rings', 'x': 78338.64, 'y': 47196.0}, {'id': 'TopologyFiber_Bundle', 'x': 67446.0, 'y': 42444.0}, {'id': 'Complex_AnAnalytic_Space', 'x': 62986.8, 'y': 41796.0}, {'id': 'Func_AnBanach_Space', 'x': 60322.41600000001, 'y': 47092.32}, {'id': 'Func_AnHilbert_Space', 'x': 45100.8, 'y': 29160.0}, {'id': 'Info_MathFormal_Language_Theory_and_Automata', 'x': 56210.57142857143, 'y': 38741.142857142855}, {'id': 'Info_MathComputational_Complexity_Theory', 'x': 37401.600000000006, 'y': 26460.0}, {'id': 'GeometryEuclidean_Space', 'x': 55834.14545454544, 'y': 43465.09090909091}, {'id': 'GeometryEuclidean_Geometry', 'x': 48575.55, 'y': 40608.0}, {'id': 'Groups_and_RepFinite_Group', 'x': 65652.0, 'y': 36396.0}, {'id': 'GeometryCurves', 'x': 50433.80000000001, 'y': 40428.0}, {'id': 'Sets_and_TopologyUniform_Spaces', 'x': 65703.2, 'y': 42876.0}, {'id': 'GeometryConformal_Geometry', 'x': 61213.8, 'y': 39420.0}, {'id': 'AlgebraCommutative_Rings', 'x': 68932.8, 'y': 47700.0}, {'id': 'AlgebraJordan_Algebras', 'x': 33747.6, 'y': 43308.00000000001}, {'id': 'AlgebraMultivariate_Rings', 'x': 42219.6, 'y': 43308.00000000001}, {'id': 'Number_TheoryNumber-Theoretic_Functions', 'x': 83301.2, 'y': 48348.0}, {'id': 'TopologyComplex', 'x': 47080.4, 'y': 46908.0}, {'id': 'Math_LogicModel_Theory', 'x': 39865.499999999985, 'y': 47034.0}, {'id': 'Math_LogicDecision_Problems', 'x': 24441.6, 'y': 48060.00000000001}, {'id': 'Opt_TheoryGame_Theory', 'x': 104628.0, 'y': 48492.00000000001}, {'id': 'Alg_GeometryAlgebraic_Curves', 'x': 73027.2, 'y': 50220.0}, {'id': 'Number_TheoryGeometry_of_Numbers_and_Approximations_in_Number_Theory', 'x': 40881.6, 'y': 50436.0}, {'id': 'AlgebraGalois_Theory', 'x': 56660.24999999999, 'y': 52596.0}]

    for n in range(len(directories)):
        part_json = open('graph_attrs/cluster/compound_dot_graph' + str(directories[n]['id']) + ".json", 'r')
        part_objects = json.load(part_json)

        positionXsum = 0
        positionYsum = 0
        count = 0
        for i in range(len(part_objects['eleObjs'])):
            if part_objects['eleObjs'][i]["group"] == "nodes" and part_objects['eleObjs'][i]["data"]["id"] != "TARSKI_0" and part_objects['eleObjs'][i]["data"]["id"] != "TARSKI_A":
                positionXsum += part_objects['eleObjs'][i]['position']['x']
                positionYsum += part_objects['eleObjs'][i]['position']['y']
                count += 1

        positionX = directories[n]['x'] - (positionXsum / count)
        positionY = directories[n]['y'] - (positionYsum / count)
        for j in range(len(allgraph_objects['eleObjs'])):
            if allgraph_objects['eleObjs'][j]["group"] == "nodes":
                for k in range(len(part_objects['eleObjs'])):
                    if part_objects['eleObjs'][k]["group"] == "nodes" and part_objects['eleObjs'][k]["data"]["id"] != "TARSKI_0" and part_objects['eleObjs'][k]["data"]["id"] != "TARSKI_A":
                        if part_objects['eleObjs'][k]["data"]["id"] == allgraph_objects['eleObjs'][j]["data"]["id"]:
                            allgraph_objects['eleObjs'][j]['position']['x'] = part_objects['eleObjs'][k]['position']['x'] + positionX
                            allgraph_objects['eleObjs'][j]['position']['y'] = part_objects['eleObjs'][k]['position']['y'] + positionY
                            break

    # ノードの重なりを解消する
    adjust_directory_positions(allgraph_objects, directories)

    with open('graph_attrs/output/'+output, 'w') as f:
        json.dump(allgraph_objects, f, indent=4)