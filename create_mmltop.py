import json
import glob
import create_graph
import os

def create_small_graph(jsonfile):
    # ノードを分類毎に分けたtxtファイルを生成
    classification_data = jsonfile

    filelist = glob.glob("mml/*.txt")
    for file in filelist:
        os.remove(file)
    filelist = glob.glob("graph_attrs/cluster/*.json")
    for file in filelist:
        os.remove(file)

    # 分類ごとにテキストファイルを作成
    for classification in classification_data['mml_classification']:
        if classification.get("directory"):
            ancestorDirectory = classification['directory']
            if ancestorDirectory != "":
                directory = ancestorDirectory.split("/")[1]
                directory = directory.replace("/", "")

                if directory != "" :
                    nodes = classification['mml-name']

                    # 同じ分類のノード名を記録したテキストファイルを作成
                    with open(f'mml/{directory}.txt', mode='a') as txt_file:
                        txt_file.write(nodes + "\n")

    files = glob.glob("mml/*.txt")
    for fileName in files:
        directoryName = fileName.split(".")[0].split("/")[1]
        create_graph.create_part_graph(directoryName)

#初期状態グラフを作る
def create_all_graph(graphname):

    filelist = os.listdir("mml/miz_files")
    # ファイル名から拡張子を除く
    filelist = [file[:-4] for file in filelist]
    # ファイル名を改行で区切って文字列にする
    filestr = "\n".join(filelist)
    listname = "miz_list/all_article_list.txt"
    # txtファイルに書き込む
    with open("mml/"+listname, "w") as f:
        f.write(filestr)

    create_graph.create_dependency_only_graph(listname, graphname)


if __name__ == '__main__':
    create_small_graph("mml_classification_1403_replace")