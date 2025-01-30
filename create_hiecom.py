import os
import sys
import glob
import num2name
import create_mmltop
import create_comgraph
import create_compound_hierarchical
import create_graph

# jsonファイル内の部門・項目番号を英名に変換
path = "mml_classification_1403"
print("Enter the file name of the classification table in json format under graph_attrs")
print("If empty, it will be the default")
print("Default:"+path)
inputpath = input()
if inputpath:
    if os.path.isfile("graph_attrs/"+inputpath+".json"):
        path = inputpath
    else:
        print("graph_attrs/"+inputpath+".json not found")
        sys.exit(1)
print("Please wait a while...")
replace_objects = num2name.number_replace(path)
print("Done:replace number")

# 項目毎の小グラフを作成
# この段階でmml-nameに時刻が載っており，エラーを吐くケースがあった．分類表→json変換時になんか混じる可能性
create_mmltop.create_small_graph(replace_objects)
print("Done:create small graph")

# 全アーティクルのグラフ(スライドにおける"初期状態")を作成
dep_only_graphname = "compound_dot_graph.json"
listname = "all_article_list"
print("Enter the file name for the article list under mml/miz_list")
print("If empty, it will be the default")
print("Default:"+listname)
inputlistname = input()
if inputlistname:
    if os.path.isfile("mml/miz_list/"+inputlistname+".txt"):
        listname = inputlistname
    else:
        print("mml/miz_list/"+inputlistname+".txt not found")
        sys.exit(1)
fulllistname = "miz_list/"+listname+".txt"
print("Please wait a while...")
create_graph.create_dependency_only_graph(fulllistname, dep_only_graphname)
print("Done:create dependency only graph")

# 全アーティクルのグラフのノードに親名を割り当てる
unadjusted_graph = "unadjusted_graph.json"
directories = create_comgraph.create_compound_graph(dep_only_graphname, replace_objects, unadjusted_graph)
print("Done:directory assignment")

# 重心位置に小グラフの配置，重なり除去
output = "graph_compound_hierarchical"
print("Enter the file name for the output file")
print("If empty, it will be the default")
print("Default:"+output)
inputoutputname = input()
if inputoutputname:
    output = inputoutputname
print("Please wait a while...")
create_compound_hierarchical.graph_adjust(unadjusted_graph, directories, output+".json")
print("Done:create graph_attrs/output/"+output+".json")
print("Entering 'yes' will delete the temporary file created")
isdelete = input()
if isdelete == 'yes':
    filelist = glob.glob("mml/*.txt")
    for file in filelist:
        os.remove(file)
    filelist = glob.glob("graph_attrs/cluster/*.json")
    for file in filelist:
        os.remove(file)
    os.remove("graph_attrs/unadjusted_graph.json")
    os.remove("graph_attrs/compound_dot_graph.json")