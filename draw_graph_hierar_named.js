/*
createGraph.pyで出力されたファイルとcytoscape.jsを使って
グラフの描画を行う
*/
$(function(){
    $.when($.getJSON('./graph_attrs/output/graph_compound_hierarchical.json'), $.getJSON('./graph_attrs/iwanami_div_trans.json'), $.getJSON('./graph_attrs/iwanami_trans.json')).then((dot_graph, divitions, items) => {
        $(".has-sub").children(".sub").stop().slideToggle();
        // cytoscapeグラフの作成(初期化)
        let cy = window.cy = cytoscape({
            container: document.getElementById('graph'),
            elements: [],
            boxSelectionEnabled: true,
            autounselectify: false,
            selectionType: "additive",
            wheelSensitivity: 0.1,
            autounselectify: true,
            zoom: 0.025,    
        });
        
        let contextMenu = cy.contextMenus({ //右クリック時のコンテキストメニュー
            evtType: ['cxttap'],
            menuItems: [
                {
                    id: 'Highlight Connected Nodes',
                    content: 'Highlight Connected Nodes',
                    tooltipText: 'Highlight Connected Nodes',
                    selector: 'node',
                    onClickFunction: (event) => {
                        event.target.trigger("clickElement", event);
                    },
                    hasTrailingDivider: true,
                },
                {
                    id: 'Go to Source Code',
                    content: 'Go to Source Code',
                    tooltipText: 'Go to Source Code',
                    selector: 'node',
                    hasTrailingDivider: true,
                    onClickFunction: (event) => {
                        try {  // your browser may block popups
                            window.open(event.target.data("href"));
                        } catch(e){  // fall back on url change
                            window.location.href = event.data("href");
                        }
                    },
                },
                {
                    id: 'open/close',
                    content: 'open/close',
                    tooltipText: 'open/close',
                    selector: 'node',
                    hasTrailingDivider: true,
                    onClickFunction: (event) => {
                        event.target.trigger("doubleTap", event);
                    }
                }
            ],
        });
        
        
        // Set graph style
        cy.style([
            /* 初期状態のスタイル */
            {
                selector: "node",
                css: {"background-color": "#000000", "shape": "ellipse", "width": "80", "height": "80",
                "content": "data(name)", 'font-size': 60, "opacity": 1, "z-index": 1,
                "text-halign":"right", "text-valign": "center", "font-style": "normal",
                "font-weight": "bold", "color": "#000000",
                "text-outline-color": "#FFFFFF", "text-outline-opacity": 1, "text-outline-width": 6}
            },
            {
                selector: 'node:parent',
                css: {
                    'content': 'data(name)',
                    'font-size': 500,
                    "text-outline-color": '#FFFFFF',
                    'color': '#000000',
                    'text-valign': 'top',
                    'text-halign': 'center',
                    'background-color': '#20bd3d',
                    'background-opacity': 0.25
                }
            },
            {
                selector: "edge",
                css: {"line-color": "black", "target-arrow-shape": "triangle", "curve-style": "straight",
                "target-arrow-color": "black", "arrow-scale": 3, "width": 5, "opacity": 0.3, "z-index": 1,}
            },
            /* ノードが左クリックされたときに適応されるスタイル */
            // 選択されたノード全てのスタイル
            {
                selector: "node.highlight",
                css: {'font-size': 120,  "width": 250, "height": 250, "font-size": 100,
                "content": "data(name)", "opacity": 1, "z-index": 10}
            },
            // 選択(左クリック)されたノードのスタイル
            {
                selector: "node.selected",
                css: {"background-color": "#99ff00", "color": "#006633", "width": 300, "height": 300,
                "text-outline-color": "#99ff00", "text-outline-opacity": 1, "text-outline-width": 10}
            },
            // 選択された(強調表示する)祖先のスタイル
            {
                selector: "node.selected_ancestors0", 
                css: {"background-color": "#ffbb00", "color": "#660033",
                "text-outline-color": "#ffbb00", "text-outline-opacity": 1, "text-outline-width": 10}
            },
            {
                selector: "node.selected_ancestors1",
                css: {"background-color": "#ff9900", "color": "#660033",
                "text-outline-color": "#ff9900", "text-outline-opacity": 1, "text-outline-width": 10}
            },
            {
                selector: "node.selected_ancestors2",
                css: {"background-color": "#ff7700", "color": "#660033",
                "text-outline-color": "#ff7700", "text-outline-opacity": 1, "text-outline-width": 10}
            },
            {
                selector: "node.selected_ancestors3",
                css: {"background-color": "#ff4400",  "color": "#660033",    
                "text-outline-color": "#ff4400", "text-outline-opacity": 1, "text-outline-width": 10}
            },
            {
                selector: "node.selected_ancestors4",
                css: {"background-color": "#ff0000",  "color": "#660033",
                "text-outline-color": "#ff0000", "text-outline-opacity": 1, "text-outline-width": 10}
            },
            // 選択された(強調表示する)子孫のスタイル
            {
                selector: "node.selected_descendants0",
                css: {"background-color": "#00ffff", "color": "#330066",
                "text-outline-color": "#00ffff", "text-outline-opacity": 1, "text-outline-width": 10}
            },
            {
                selector: "node.selected_descendants1",
                css: {"background-color": "#00ddff", "color": "#330066",
                "text-outline-color": "#00ddff", "text-outline-opacity": 1, "text-outline-width": 10}
            },
            {
                selector: "node.selected_descendants2",
                css: {"background-color": "#00bbff", "color": "#330066",
                "text-outline-color": "#00bbff", "text-outline-opacity": 1, "text-outline-width": 10}
            },
            {
                selector: "node.selected_descendants3",
                css: {"background-color": "#0077ff", "color": "#330066",
                "text-outline-color": "#0077ff", "text-outline-opacity": 1, "text-outline-width": 10}
            },
            {
                selector: "node.selected_descendants4",
                css: {"background-color": "#0000ff", "color": "#330066",
                "text-outline-color": "#0000ff", "text-outline-opacity": 1, "text-outline-width": 10}
            },
            {
                selector: "node.interaction",
                css: {"background-color": "#ff00ff", "color": "#330066",
                "text-outline-color": "#ff00ff", "text-outline-opacity": 1, "text-outline-width": 10}
            },
            // 強調表示されたノードをつなぐエッジのスタイル
            {
                selector: "edge.highlight",
                css: {"line-color": "#004400", "curve-style": "straight",
                "target-arrow-color": "#004400", "arrow-scale": 5, "width": 10, "opacity": 1, "z-index": 20}
            },
            /* ダミーノードを指すエッジが選択された場合 */
            {
                selector: cy.nodes().edgesTo("node.selected[?is_dummy]"),
                css: {"line-color": "green", "target-arrow-shape": "none", "curve-style": "straight",
                "arrow-scale": 10, "width": 5, "z-index": 10, width: 20}
            },
            // 選択されていないノードの色を変更
            {
                selector: "node.faded",
                css: {"background-color": "#808080", "text-outline-color": "#808080", "color": "#ffffff"}
            },
            // 選択されていないノードとエッジは薄く表示する
            {
                selector: ".faded",
                css: {"opacity": 0.15, "z-index": 0}
            },
            {
                selector: "node:parent.faded",
                css: {"opacity": 1}
            },
            {
                selector: "node.select",
                css: {"background-color": "#FF0000"}
            },
            // カラーパレットの色に対応するセレクタ
            {
                selector: "node.cluster_0000ff", // 青色
                css: {"background-color": "#0000FF"}
            },
            {
                selector: "node.cluster_00ff00", // 緑色
                css: {"background-color": "#00FF00"}
            },
            {
                selector: "node.cluster_4b0082", // 紫色
                css: {"background-color": "#4B0082"}
            },
            {
                selector: "node.cluster_8b00ff", // 藍色
                css: {"background-color": "#8B00FF"}
            },
            {
                selector: "node.cluster_ff0000", // 赤色
                css: {"background-color": "#FF0000"}
            },
            {
                selector: "node.cluster_ff7f00", // 橙色
                css: {"background-color": "#FF7F00"}
            },
            {
                selector: "node.cluster_ffff00", // 黄色
                css: {"background-color": "#FFFF00"}
            },
            {
                selector: "node.cluster_ff0095", // 紅紫色
                css: {"background-color": "#ff0095"}
            },
            
            
        ]);

        // 初期設定
        // json自体は[0]に格納されている(それ以降にはjsonの取得の成功/失敗ステータス等が入っている)
        cy.add(dot_graph[0]["parents"]); //先にparentsを描画しなければ正しくレイアウトされないため、parentsから描画する
        let directories = dot_graph[0]["parents"].map(parent => parent.data["id"]); //ディレクトリ一覧を作成
        
        cy.add(dot_graph[0]["eleObjs"]);
        const id2relatedElements = new Map(); //全ノードのid・親子(複合)・接続エッジなどを格納
        /**id       :ノードのid
         * children :ノードのクラスタリング上の子ノード情報
         * edges    :ノード，子ノードと接続している全てのエッジ情報
         * parent   :ノードのクラスタリング上の親ノード情報
         * ancestors:ノードの親ノードを含む祖先ノード情報
         * isParent :ノードが子ノードを持つかどうか
         * removed  :ノードが非表示となっているかどうか
         * 
         * Conpound graphsを使用しているとcytoscapeのノード非表示関数ele.hidden()が機能しなかったため、当コードでは削除/復元によって代用している。
         * id2relatedElementsは復元時のデータ読み込みに使用
         * 
        */
        let nodes = cy.nodes();
        nodes.forEach(node => { //初期状態での全ノードの、関連するエッジの情報を記録
            
            let currentNode = cy.$(node);
            let id = currentNode.data('id');
            
            let childrenNodes = currentNode.children();
            let connectedEdges = currentNode.connectedEdges();
            let childConnectedEdges = currentNode.descendants().connectedEdges();
            let parentNode = currentNode.data('parent');
            let ancestorNodes = currentNode.ancestors().map(ancestor => ancestor.id());
            ancestorNodes.sort().reverse();
            
            let isParent = childrenNodes.length > 0;
            currentNode.style({
                'shape': isParent ? 'square' : 'ellipse',
                'width': isParent ? '200' : '80',
                'height': isParent ? '200' : '80',
                'color': '#000000',
                'text-outline-color': '#FFFFFF',
                'text-valign': isParent ? 'top' : 'center',
            });
            
            
            id2relatedElements.set(id, {
                children :childrenNodes, 
                edges: connectedEdges.union(childConnectedEdges), 
                parent: parentNode, 
                ancestors: ancestorNodes, 
                isParent: isParent, 
                removed: false
            });
        })
        
        let layout = cy.elements().layout({ //klayレイアウトを適用する場合は.run()を実行する
            name: "klay",
            spacingFactor: 10
        })
        //layout.run()

        // jsonからサイドバーを作成
        let level1 = {};
        for (let key in divitions[0]){
            let arabic = romanToArabic(key);
            level1[arabic] = divitions[0][key];
        }
        let level2 = {};
        for (let key in items[0]){
            let arabic = romanToArabic(key);
            level2[arabic] = items[0][key];
        }
        createAccordionMenu(level1, level2, id2relatedElements);
        
        all_nodes_positions = cy.nodes().positions();  //ノードの位置を記録　今のところ使ってない
        cy.fit(cy.nodes().orphans());

        // 最上位の親リスト(progenitor)を作成，グラフの拡大/縮小時にprogenitorのフォントサイズが変わる
        let allAncestors = nodes.ancestors();
        let allOrphans = nodes.orphans();
        let progenitor = allAncestors&&allOrphans;
        for(let i=progenitor.length-1; i>=0; i--){//TARSKIを配列から削除
            if(!progenitor[i]._private.data.id.match(/^[\/]/)){
                progenitor.splice(i, 1);
            }
        }
        
        let parent_nodes_positions = new Map();
        (allAncestors&&allOrphans).forEach(parent => {
            let position = parent.position();
            parent_nodes_positions.set(parent._private.data.id, {x:position.x, y:position.y});
        })
        
        // 強調表示する祖先、子孫の世代数の初期化
        let ancestor_generations = 1;
        let descendant_generations = 1;
        

        cy.nodes().lock();
        $("#open").prop("disabled", true);
        
        // 全ノード名の取得
        let all_article_names = [];
        let all_parent_names = [];
        nodes.orphans().forEach(function(parent){
            if(parent.isParent())all_parent_names.push([parent.data("name"), "/"+parent.data("name")]);
            function childrenPush(parent, parentFullname){
                parent.children().forEach(function(child){
                    if(child.isParent())all_parent_names.push([child.data("name"), parentFullname+"/"+child.data("name")]);
                    if(child.children())childrenPush(child, parentFullname+"/"+child.data("name"));
                })
            }
            childrenPush(parent, "/"+parent.data("name"))
            all_parent_names.push("")
        })
        
        
        /* 検索機能 */
        cy.nodes("[!is_dummy]").forEach(function(node){
            if(!id2relatedElements.get(node.id()).isParent) all_article_names.push(node.data("name"));
        });
        all_article_names.sort();
        // 検索時のサジェスト・ディレクトリ一覧表示に使用するdatalistに全ノード名を追加
        for (let article_name of all_article_names){
            $("#article_list").append($("<option/>").val(article_name).html(article_name));
        }
        // searchボタンをクリックしたら検索開始
        $("#search").click(function() {
            searchNode($("#article_name").val(), nodes, id2relatedElements)
        });
        // 入力が終わった時も検索を開始する
        $("#article_name").change(function() {
            searchNode($("#article_name").val(), nodes, id2relatedElements)
        });
        
        function searchNode(nodeName, nodes, id2relatedElements){
            // dropdownで選択したノード名、または記述したノード名を取得
            let select_node_name = nodeName;
            let select_node = nodes.filter(function(ele){
                return ele.data("name") == select_node_name;
            });
            // ノードが存在するか確認し、処理
            if(select_node.data("name")){
                    if(id2relatedElements.get(select_node.data("name")).removed){
                        let ancestorsOfSelectnode = id2relatedElements.get(select_node.data("name")).ancestors
                        for(let i = ancestorsOfSelectnode.length -1; i > -1; i--){// ノードが格納されている場合，格納したディレクトリを上層から順に開くためデクリメントで処理
                            if(id2relatedElements.get(ancestorsOfSelectnode[i]).removed) restoreChildren(ancestorsOfSelectnode[i], cy.$(ancestorsOfSelectnode[i]), id2relatedElements)
                        }
                    $("#close").prop("disabled", false);
                    let allopen = true
                    directories.forEach(function(dir){
                        if(id2relatedElements.get(dir).removed) allopen = false;
                    })
                    if(allopen == true) $("#open").prop("disabled", true);
                }
                
                reset_elements_style(cy);
                cy.$(select_node).addClass("selected");
                highlight_select_elements(cy, select_node, ancestor_generations, descendant_generations);
                $("#select_article").text("SELECT: " + select_node_name);
                $(".color_index").removeClass("hidden_");
                cy.center(select_node)
            }
            else{
                alert("ERROR: Don't have '" + select_node_name + "' node. Please select existed nodes.");
            }
        }
        

        // 強調表示したい祖先、子孫の世代数を取得
        $("#ancestor_generations").on("change", function(){
            ancestor_generations = $("#ancestor_generations").val();
            generation();
        });
        $("#descendant_generations").on("change", function(){
            descendant_generations = $("#descendant_generations").val();
            generation();
        });
        
        function generation(){
            if(cy.nodes(".selected").data()){
                let selected_node = cy.nodes().filter(function(ele){
                    return ele.data("name") == cy.nodes(".selected").data("name");
                });
                reset_elements_style(cy);
                highlight_select_elements(cy, selected_node, ancestor_generations, descendant_generations);
            }
        }
        
        // resetボタンでグラフのカラーリングをリセット
        $(document).ready(function(){
            $("#reset").click(function(){
                reset_elements_style(cy);
                // 以下のコードを追記
                cy.nodes().forEach(function(node){ // 全ノードを走査
                    var classes = node.classes(); // ノードのクラスを取得
                    classes.forEach(function(cls){ // クラスを一つずつチェック
                        if (cls.startsWith("cluster_")){ // クラスが「cluster_」から始まる場合
                            node.removeClass(cls); // そのクラスを取り除く
                        }
                    });
                });
                // id属性値がcluster_から始まる要素を全て取得
                var elements = $("[id^='cluster_']");
                // 取得した要素の中から、id属性値がcluster_coloring_indexで終わる要素を除外
                elements = elements.not("[id$='cluster_coloring_index']");            
                // 取得した要素のtextを空にする
                elements.text("");
                
                $("#cluster_coloring_index").hide();
                
            });
        });
        
        //closeボタン押下時
        $("#close").click(function(){
            removeNodes(closeButton = true);
        })
        
        function removeNodes(closeButton, id, selectedNode){
            reset_elements_style(cy);
            $(".color_index").addClass("hidden_");
            $("#open").prop("disabled", false);
            if(closeButton){
                let bottom = -1;
                let removes = [];
                nodes.parent().forEach(function(node){// 表示されているディレクトリの内，最も深い層のものを探し全て非表示にする
                    if(bottom < node.ancestors().length){
                        removes = [];
                        bottom = node.ancestors().length
                    }
                    if(bottom == node.ancestors().length){
                        removes.push(node)
                    }
                })
                removes.forEach(function(remove){
                    recursivelyRemove(remove.id(), remove, id2relatedElements)
                })
            }
            else recursivelyRemove(id, selectedNode, id2relatedElements);
            let allclose = true
            directories.forEach(function(dir){
                if(!id2relatedElements.get(dir).removed) allclose = false;
            })
            if(allclose == true) $("#close").prop("disabled", true);// 非表示にできるディレクトリがなければボタンを非アクティブ化する
        }
        
        //openボタン押下時
        $("#open").click(function(){
            restoreNodes(openButton = true)
        })
        function restoreNodes(openButton, id, selectedNode){
            $("#close").prop("disabled", false);
            if(openButton){
                $(".color_index").addClass("hidden_");
                cy.nodes().forEach(function(node){
                    if(id2relatedElements.get(node.id()).removed && id2relatedElements.get(node.id()).isParent) {
                        restoreChildren(node.id(), node, id2relatedElements)
                    }
                })
            }
            else restoreChildren(id, selectedNode, id2relatedElements)
            
            if(cy.nodes(".selected").data()){
                let selected_node = cy.nodes().filter(function(ele){
                    return ele.data("name") == cy.nodes(".selected").data("name");
                });
                reset_elements_style(cy);
                highlight_select_elements(cy, selected_node, ancestor_generations, descendant_generations);
            }
            
            let allopen = true
            directories.forEach(function(dir){
                if(id2relatedElements.get(dir).removed) allopen = false;
            })
            if(allopen == true) $("#open").prop("disabled", true);// 全てのディレクトリが表示されていればボタンを非アクティブ化
        }
        
        $("#lock").click(function(){
            if(cy.nodes()[0].locked()){
                cy.nodes().unlock();
            }
            else cy.nodes().lock();
        })
        
        $("#edges").click(function(){
            if($("#edges").val() == "show"){
                cy.edges().forEach(edge => {
                    let sourceParent = edge.source().parent();
                    let targetParent = edge.target().parent();
                    if (sourceParent.empty() || targetParent.empty() || sourceParent.id() != targetParent.id()){
                        edge.style({'visibility': 'hidden'});
                    }
                });
                $("#edges").val("hide");
            }
            else {
                cy.edges().style({'visibility': 'visible'});
                $("#edges").val("show");
            }
        })
        
        cy.on("clickElement", "node", function(event){
            if(!cy.$(this).hasClass("selected")){// クリックしたノードと，エッジで繋がるノードの色を変更
                if(!id2relatedElements.get(this.id()).removed) recursivelyRemove(this.id(), this, id2relatedElements)
                selection(event);
            }    
        });
        
        function selection(event){
            // 全ノードをクラスから除外
            reset_elements_style(cy);
            // クリックしたノードをselectedクラスに入れる
            let clicked_node = event.target;
            highlight_select_elements(cy, clicked_node, ancestor_generations, descendant_generations);
            let clicked_node_name = clicked_node.data("name");
            $("#select_article").text("SELECT: " + clicked_node_name);
            $(".color_index").removeClass("hidden_");
        }
        
        /*ノードのタップ時の挙動*/
        let doubleClickDelayMs= 350; //ダブルクリックと認識するクリック間隔
        let previousTapStamp = 0;
        cy.nodes().on('tap', function(e) {
            let currentTapStamp= e.timeStamp;
            let msFromLastTap= currentTapStamp -previousTapStamp;
            if(id2relatedElements.get(e.target.id()).isParent){//複合親ノードであればダブルクリックかを判定
                if (msFromLastTap < doubleClickDelayMs && msFromLastTap > 0) {
                    e.target.trigger('doubleTap', e);
                }
            }
            else if(!cy.$(e.target.id()).hasClass("selected")){// クリックしたノードの親と子、自身を色変更
                selection(e);
            }
            previousTapStamp= currentTapStamp;
            
        });
        
        //ダブルタップ
        cy.on('doubleTap', 'node', function(){ //フラグに応じて削除・復元
            let nodes = this;
            let id = nodes.data('id')
            if(cy.$(this).hasClass("selected")){
                reset_elements_style(cy);
                $(".color_index").addClass("hidden_");
            }
            
            if(id2relatedElements.get(id).removed == true){
                restoreNodes(openButton = false, id, nodes)
            } else{
                removeNodes(closeButton = false, id, nodes)
            }
        });
        
        // 背景をクリックしたときの処理
        cy.on("tap", function(event){
            let clicked_point = event.target;
            if (clicked_point === cy){
                reset_elements_style(cy);
                $(".color_index").addClass("hidden_");
            }
        });
        // エッジをクリックしたとき，グラフを初期状態のスタイルにする
        cy.edges().on("tap", function(event){
            reset_elements_style(cy);
            $(".color_index").addClass("hidden_");
        });
        
        //ノード右クリック時のメニュー表示
        cy.on('cxttap', 'node', function(e){
            document.getElementById("name-plate").style.fontSize = ""
            document.getElementById("name-plate").innerHTML = "";
            if(id2relatedElements.get(e.target.id()).isParent){
                contextMenu.showMenuItem('open/close')
                contextMenu.hideMenuItem('Go to Source Code')
            }
            else {
                contextMenu.hideMenuItem('open/close')
                contextMenu.showMenuItem('Go to Source Code')
            }
        })
        
        // ツリーペイン右クリック時のメニュー表示
        $(".context").on("contextmenu", function(e) {
            e.preventDefault();
            $("#contextmenu").children().removeAttr("name")
            $("#contextmenu").show();
            $("#contextmenu").css({left: e.pageX, top: e.pageY});
            let buttonId = $(this).attr("id");
            $("#contextmenu").children().attr("name", buttonId);
        })
        
        // coloringクラスのボタンをクリックしたときの処理
        $(".coloring").click(function(e) {
            // カラーパレットの位置をマウスの座標に合わせる
            $(".palette").css({
                "left": e.pageX + "px",
                "top": e.pageY + "px"
            });
            // カラーパレットを表示する
            $(".palette").show();
            // クリックしたボタンのidを取得する
            var buttonId = $(this).attr("name");
            // ボタンのidをカラーパレットにデータとして保存する
            $(".palette").data("buttonId", buttonId);
        });
        $(".pan").click(function(){
            let node = cy.$("[id^='/" + $(this).attr("name") + "']");
            cy.zoom(0.1);
            cy.center(node);
        })
        
        // カラーパレットの色をクリックしたときの処理
        $(".color").click(function() {
            let cluster = ["cluster_0000ff","cluster_00ff00","cluster_4b0082","cluster_8b00ff", "cluster_ff0000","cluster_ff7f00", "cluster_ffff00", "cluster_ff0095"]
            // クリックした色のカラーコードを取得する
            var rgb = $(this).css("background-color").toString(); 
            rgb = rgb.replace("rgb(", ""); rgb = rgb.replace(")", ""); 
            rgb = rgb.split(","); 
            var colorCode = "#";
            for(var i = 0; i < 3; i++){
                var hex = parseInt(rgb[i]).toString(16); //10進数を16進数に変換
                if(hex.length == 1){ //1桁の場合は0を足す
                    hex = "0" + hex;
                }
                colorCode += hex; //カラーコードに追加
            }
            // カラーパレットからボタンのidを取得する
            var buttonId = $(".palette").data("buttonId");
            // カラーパレットを非表示にする
            $(".palette").hide();
            if (cy.$(".cluster_" + colorCode.slice(1)).length > 0) {
                // その全ての既存のノードのクラスを除去する
                cy.$(".cluster_" + colorCode.slice(1)).removeClass("cluster_" + colorCode.slice(1));
            }
            // idがボタンのidから始まる名前のノードを検索する
            var nodes = cy.$("[id^='/" + buttonId + "']");
            nodes.removeClass(cluster);
            // ノードにクラスを追加する
            nodes.addClass("cluster_" + colorCode.slice(1));
            $("#cluster_coloring_index").show();
            // id属性値がcluster_から始まる要素を全て取得
            let elements = $("[id^='cluster_']");
            
            // 取得した要素のtextを走査
            elements.each(function() {
                // textがbuttonIdと前方一致するか判定
                if ($(this).text().startsWith(buttonId)) {
                    // 前方一致したらtextを空にする
                    $(this).text("");
                }
            });
            $("#cluster_" + colorCode.slice(1)).text(buttonId);
        });

        // 色の割当
        let all_cluster_color = ["cluster_indigo", "cluster_cyan", "cluster_teal", "cluster_green", "cluster_olive", "cluster_sand", "cluster_rose", "cluster_wine", "cluster_purple"];
        let color_number = 0;
        $("li").click(function(){
            if($(this).hasClass("btnGen1")){
                let cluster = cy.$(this.id).descendants();
                console.log(cluster,this,this.id)
                cluster.forEach(child => {
                    if(!child.isParent()){
                        child.addClass(all_cluster_color[color_number]);
                        let element = document.getElementById(child._private.data.id);
                        element.style.color = "#332288";
                    }
                });
                document.getElementById(all_cluster_color[color_number]).innerHTML = cy.$(this.id).id()
                color_number++;
                if(color_number >= all_cluster_color.length)color_number = 0;
            }
            else{
                let nodeID = $(this).text()
                searchNode(nodeID, nodes, id2relatedElements)
            }
        });
        
        // カラーパレット以外の場所がクリックされた時の処理
        $(document).on('click', function(e) {
            // クリックされた要素がカラーパレットやボタンでない場合
            if (!$(e.target).is('.palette, .color, .coloring')) {
                // カラーパレットを非表示にする
                $('.palette').hide();
            }
            if (!$(e.target).is("#contextmenu")) {
                $("#contextmenu").hide();
            }
        });
        
        cy.on("zoom", function(e){
            fontsize(progenitor);
        })
        
        // ノードの上にカーソルが来たとき，ノード名を表示する
        // jQuery.hoverを使うと動作が重くなるためmouseover/outを使用している
        cy.nodes().on("mouseover", function(cy_event){
            $(window).on("mousemove", function(window_event){ 
                document.getElementById("name-plate").style.top = window_event.clientY + (10) + "px";
                document.getElementById("name-plate").style.left = window_event.clientX + (10) +"px";
                if(!id2relatedElements.get(cy_event.target.data("id")).isParent){
                    document.getElementById("name-plate").innerHTML = id2relatedElements.get(cy_event.target.data("id")).ancestors[0] + "<br>" + cy_event.target.data("name");
                }
            })
        });
        
        cy.nodes().on("mouseout", function(){
            $(window).on("mousemove", function(window_event){ 
                document.getElementById("name-plate").style.fontSize = ""
                document.getElementById("name-plate").innerHTML = "";
            })
        })
        
    })

}, () => {
    alert("ERROR: Failed to read JSON file.");
});


/**
 * グラフの要素のスタイルを初期状態(ノード：赤い丸、エッジ：黒矢印)に戻す。
 * ただし、移動したノードの位置は戻らない。
 * @param {cytoscape object} cy グラフ本体
 * @return
**/
function reset_elements_style(cy) {
    let all_class_names = ["highlight",  "faded",  "selected", "interaction"];
    for(let i=0; i<10; i++){
        all_class_names.push("selected_ancestors" + i);
        all_class_names.push("selected_descendants" + i);
    }
    cy.elements().removeClass(all_class_names);
    //cy.nodes().unlock();
}


/**
 * 選択されたノードとそのノードの親子を強調表示させる(selectedクラスに追加する)
 * @param {cytoscape object} cy グラフ本体
 * @param {cytoscape object} select_node cy内の単一のノード
 * @param {int} ancestor_generations 辿りたい祖先の数
 * @param {int} descendant_generations 辿りたい子孫の数
 * @return
**/
function highlight_select_elements(cy, select_node, ancestor_generations, descendant_generations){
    // 選択したノードの処理
    cy.$(select_node).addClass("highlight");
    cy.$(select_node).addClass("selected");

    // 選択したノードの祖先、子孫を強調表示する
    is_ancestor = true;
    highlight_connected_elements(cy, ancestor_generations, select_node, is_ancestor);
    highlight_connected_elements(cy, descendant_generations, select_node, !is_ancestor);

    // highlightクラス以外の物はfadedクラスに入れる
    fade_out_faded_elements(cy);

    // fadedクラスの物は、動かせないようにする
    cy.$(".faded").lock();

}


/**
 * 選択したノード(select_node)とその祖先または子孫を任意の世代数(generation)までを
 * 強調表示するクラスに追加する。
 * アルゴリズム
 *      次の処理を辿りたい世代数まで繰り返す
            1. first_connected_elementsの親(もしくは子)ノードとそのエッジを強調表示させるクラスに追加する
            2. 1でクラスに追加したノードをfirst_connected_elementsとして更新する
            3. 2でfirst_connected_elementsが空ならループを中断する
 * @param {cytoscape object} cy cytoscapeのグラフ本体
 * @param {int} generation 辿りたい世代数
 * @param {cytoscape object} select_node 選択したノード
 * @param {boolean} is_ancestor 辿りたいのは祖先かどうか。trueなら祖先、falseなら子孫を強調表示させていく。
 * @return
**/
function highlight_connected_elements(cy, generation, select_node, is_ancestor){
    let first_connected_elements = cy.collection();  // 親(もしくは子)を取得したいノードのコレクション（≒リスト）
    first_connected_elements = first_connected_elements.union(select_node);
    for (let i=0; i<generation; i++){
        let class_name = is_ancestor ? "selected_ancestors" : "selected_descendants";
        class_name += Math.min(4, i);
        let second_connected_elements = cy.collection();
        cy.$(first_connected_elements).forEach(function(n){
            let connect_elements = is_ancestor ? n.outgoers() : n.incomers();
            connect_elements = connect_elements.difference(cy.$(connect_elements).filter(".highlight"));
            cy.$(connect_elements).addClass("highlight");
            cy.$(connect_elements).nodes().addClass(class_name);
            second_connected_elements = second_connected_elements.union(connect_elements.nodes());
        });
        first_connected_elements = second_connected_elements;
        if (first_connected_elements.length === 0){
            break;
        }
    }
    cy.$(select_node).incomers().forEach(function(comer){
        for(let i=0; i<10; i++){
            if(comer.hasClass("selected_ancestors" + i)){
                comer.removeClass("selected_ancestors" + i)
                comer.addClass("interaction")
            }
        }
    })
}


/**
 * 強調表示されていない(highlightクラスに属していない)ノード、エッジをfadedクラスに入れる。
 * @param {cytoscape object} cy cytoscapeグラフ本体
 * @return
**/
// convert style to fade
function fade_out_faded_elements(cy){  // change_style_to_fade_for_not_selected_elements
    let other = cy.elements();
    other = other.difference(cy.elements(".highlight"));
    cy.$(other).addClass("faded");
}

/**
 * 子ノード群を非表示(処理上は削除)にする．
 * @param {string} id クリックされたノードのid
 * @param {cytoscape object} nodes 非表示にするノード群
 * @param {Map} id2relatedElements 全ノードのデータ
**/
function recursivelyRemove(id,nodes, id2relatedElements){
    let removingNodesList = [];
    for(;;){ //選択されたノードと子をリストに入れ、削除フラグを付ける
        nodes.forEach(function(node){
            id2relatedElements.get(node.data('id')).removed = true;
        });
        Array.prototype.push.apply(removingNodesList, nodes.children());
        // list.push()の場合，削除対象のノード群の配列が正しく生成できなかったためArrayを使用
        nodes = nodes.children();
        if( nodes.empty() ){ break; }
    }

    //当該サブグラフに関連するエッジ全てを一度削除する
    for( let x = removingNodesList.length - 1; x >= 0; x-- ){ //最下層のノードから処理し、順次削除
        let removeEdges = removingNodesList[x].connectedEdges();
        for(let y = 0; y < removeEdges.length; y++){ //エッジの削除・置き換え
            if(removeEdges[y].target().parent() != removeEdges[y].source().parent()){
                let replaceEdge = removeEdges[y];
                removeEdges[y].remove();
                
                let newSource;
                let newTarget;
                if(replaceEdge.target() == removingNodesList[x]){
                    newSource = replaceEdge.source().id();
                    newTarget = replaceEdge.target().parent().id();
                }
                else if(replaceEdge.source() == removingNodesList[x]){
                    newSource = replaceEdge.source().parent().id();
                    newTarget = replaceEdge.target().id();
                }
                if(newSource != newTarget)cy.add({group: 'edges', data:{id: replaceEdge.id(), source: newSource, target: newTarget}})
                // 最下層から処理するため，上の層の処理により将来的に削除されるエッジを作成する場合がある
            }
        }
        removingNodesList[x].remove();
    }
}


/**
 * 非表示となっている子ノード群を表示させる．
 * 内部的にはノードは削除されていたため，id2relatedElementsから子を取得し，再配置する．
 * @param {string} id クリックされたノードのid
 * @param {cytoscape object} nodes クリックされたノードそのもの
 * @param {Map} id2relatedElements 全ノードのデータ
**/
function restoreChildren(id, nodes, id2relatedElements){
    id2relatedElements.get(id).removed = false;
    id2relatedElements.get(id).children.restore(); //ノードを復元
  
    for(let x=0; x<id2relatedElements.get(id).edges.length; x++){ //エッジを順次復元
        let restoreEdge = id2relatedElements.get(id).edges[x];
        let restoreEdgeID = restoreEdge.id();
        
        //エッジを置き換える場合
        if(cy.$('#' + restoreEdgeID).length){
            if(restoreEdge.data('target') != cy.$('#' + restoreEdgeID).target().id() || restoreEdge.data('source') != cy.$('#' + restoreEdgeID).source().id()){
                cy.remove('#' + restoreEdgeID);
            }
        }
        
        if(cy.$(restoreEdge.source()).length * cy.$(restoreEdge.target()).length == 0 ){ //エッジの完全な復元ができない場合
            let newEnds = [];
            for(let i = 0; i < 2; i++){
                let origin = (i==0 ? restoreEdge.source().id() : restoreEdge.target().id()) //本来のソース・ターゲットを取得
                let ancestors = id2relatedElements.get(origin).ancestors
                for(let y = 0; y < ancestors.length; y++){
                    if(!id2relatedElements.get(ancestors[y]).removed){
                        if(y == 0)newEnds[i] = origin
                        else newEnds[i] = ancestors[y-1];
                        break;
                    }
                }
                if(ancestors.length == 0)newEnds[i] = origin;
                if(!newEnds[i])newEnds[i] = ancestors[ancestors.length-1]
                
            }
            let newSource = newEnds[0], newTarget = newEnds[1];

            if(newSource!=newTarget){ //自己ループでなければエッジを追加
                cy.add({group: 'edges', data:{id: restoreEdgeID, source: newSource, target: newTarget}})
            }
        }
        else{
            cy.add(id2relatedElements.get(id).edges[x])
        }
    }
}
  
// 2層分のリストを入力とする関数
function createAccordionMenu(level1, level2, id2relatedElements) {
    // parent_list変数に代入する値を格納する変数
    let menu = "";
    // レベル2までの全要素を作成する
    // レベル1の要素を順に処理する
    for (let key in level1) {
      // レベル1の要素の見出しを生成する
      let level1Item = document.createElement("details");
      let level1Summary = document.createElement("summary");
      level1Summary.textContent = level1[key].replace(/_+$/, '');;
      level1Summary.className = "context";
      level1Summary.id = level1[key];
      level1Item.appendChild(level1Summary);
      // レベル2の要素を順に処理する
      for (let subkey in level2[key]) {
        // レベル2の要素の見出しを生成する
        let level2Item = document.createElement("details");
        let level2Summary = document.createElement("summary");
        level2Summary.textContent = level2[key][subkey];
        level2Summary.id = level1[key] + level2[key][subkey];
        level2Item.appendChild(level2Summary);
        // レベル2の要素にスタイルを適用する
        level2Item.style.marginLeft = "20px";
        // レベル2の要素にクラス属性を設定する
        level2Item.className = level1[key] + level2[key][subkey];
        // レベル2の要素に属する要素を格納するためのリストを生成する
        let level3List = document.createElement("ul");
        // レベル2の要素にリストを追加する
        level2Item.appendChild(level3List);
        // レベル1の要素にレベル2の要素を追加する
        level1Item.appendChild(level2Item);
        // summary要素にdisplay: block;を適用する
        level2Summary.style.display = "block";
      }
      // menu変数にレベル1の要素を文字列に変換して追加する
      menu += level1Item.outerHTML;
    }
    // parent_list変数にmenu変数の値を代入する
    parent_list.innerHTML = menu;
    // 末尾のアルファベットを除去した各ノードの親IDに対して、一致するクラス属性があるかを走査する
    // cy.nodes()の要素を順に処理する
    for (let node of cy.nodes()) {
      // 親ノードがない場合はスキップする
      if (!node.parent()) continue;
      // ノードが親ノードである場合はスキップする
      if (node.isParent()) continue;
      // 親ノードのIDから文字列の末尾に大文字のアルファベットがあった場合、その文字を削除する
      let parentId = node.parent().id();
      if (id2relatedElements.get(node.id()).parent == undefined) continue;
      if (parentId.match(/[A-Z]$/)) {
        parentId = parentId.slice(0, -1).replace(/\//g, "");
      }
      else parentId = parentId.replace(/\//g, "");

      // 一致するクラス属性を持つレベル2の要素を探す
      let level2Item = document.querySelector("." + parentId);
      // 一致するクラス属性がない場合はスキップする
      if (!level2Item) continue;
      // ノードのIDを取得する
      let nodeId = node.id();
      // ノードのIDをリストの要素として追加する
      let level3Item = document.createElement("li");
      level3Item.textContent = nodeId;
      // レベル2の要素のリストに要素を追加する
      let level3List = level2Item.querySelector("ul");
      level3List.appendChild(level3Item);
    }
    // レベル2の要素のsummaryのフォントカラーを設定する処理
    for (let key in level2) {
        for (let subkey in level2[key]) {
            // クラス名を生成
            let className = level1[key] + level2[key][subkey];
            // 一致するクラス属性を持つレベル2の要素を探す
            let level2Item = document.querySelector("." + className);
            if (level2Item == null) continue;
            // レベル2の要素に属するリストを取得
            let level3List = level2Item.querySelector("ul");
            // リストに子要素がない場合はsummaryのフォントカラーをグレーにする
            if (level3List.children.length === 0) {
                let level2Summary = level2Item.querySelector("summary");
                level2Summary.style.color = "grey";
            }
            else {
                $("#"+level2Item.className).addClass("context");
            }
        }
    }
}

function fontsize(nodes){
    let size;
    if(cy.zoom() <= 0.025){
        size = 500;
    }
    else if(cy.zoom() > 0.025 && cy.zoom() <= 0.05){
        size = 350;
    }
    else if(cy.zoom() > 0.05 && cy.zoom() <=0.07){
        size = 250;
    }
    else if(cy.zoom() > 0.07){
        size = 150;
    }
    if(cy.$(nodes[0]).style("font-size") != size + "px"){
        cy.style().selector(nodes).style({
            'font-size': size
        })
        .update()
    }
}

document.addEventListener('DOMContentLoaded', () => {
    //要素のリサイズイベント取得
    const observer = new MutationObserver(() => {
        const resizeable = document.getElementById('side')
        let graph = document.getElementById('graph');
        //要素のサイズ確認
        const width = resizeable.getBoundingClientRect().width
        const height = resizeable.getBoundingClientRect().height
        console.log('size(w,h): ', width, height)
        graph.style.left = width + "px";
    })
    observer.observe(side, {
        attriblutes: true,
        attributeFilter: ["style"]
    })
}, false)


function romanToArabic(roman) {
    const map = {
        I: 1,
        V: 5,
        X: 10,
        L: 50,
        C: 100,
        D: 500,
        M: 1000
    };
    let result = 0;
    // ローマ数字を1字ずつ処理する
    for (let i = 0; i < roman.length; i++) {
        let current = map[roman[i]];
        let next = map[roman[i + 1]];
        // IVやIXなど，現在の数字が次の数字より小さい場合は減算
        if (current < next) {
            result -= current;
        } else {
            result += current;
        }
    }
    // 結果を返す
    return result;
}