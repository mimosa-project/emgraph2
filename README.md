# emgraph2

compound_dot_graph.json作成時の留意点
 - pythonライブラリnetworkxをインストールする
 - create_graph.pyが存在するフォルダ内に2層のmml/2020-6-18(例、日付は適宜コピーした日に)フォルダを作成する
 - mizarをインストールし、MIZAR/mml下に存在する.mizファイル全てを日付フォルダ内へコピーする
 - 作成したmmlフォルダ内にmml-lar-top.txtファイルを作成し、  
グラフに描画したい(クラスタリングが完了した)article名を1行ずつ書き込む  
 - 作成した.txtファイルと日付フォルダはretrieve_dependency.pyのグローバル変数articleListとmmlDirectoryで読み取られるため    
 ファイル名の変更を行った場合、それぞれのグローバル変数の値を書き換える  
 - 上記の手順の後、create_graph.pyを実行することでcompound_dot_graph.jsonが作成される

mml-lar-topファイル内の様式(一部)
```
tarski
xboole_0
boole
xboole_1
enumset1
```

```mermaid
graph TD;
    A[mizファイル群<br>mml-lar-top.txt]--呼び出し-->B[retrieve_dependency.py];
    B--呼び出し-->C[create_graph.py];
    C--実行により生成-->D[graph_attrs/compound_dot_graph.json];
    E[mml_classification.xlsx]-->F[toJson.html];
    F--html内で変換-->G[graph_attrs/mml_classification.json];
    D--呼び出し-->H[create_comgraph.py];
    G--呼び出し-->H;
    H--実行により生成-->I[graph_attrs/graph_class.json];
    I--呼び出し-->J[draw_graph.js];
    J--呼び出し-->K[hierarchical_graph.html];
    L[ライブラリ群<br>cytoscape-context-menus.js<br>cytoscape-klay.js]-->K
    M[style.css]-->K;
```