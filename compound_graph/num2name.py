import json


def split_roman_and_num(s):
    # ローマ数字とアラビア数字の対応表を辞書型で作る
    roman_dict = {'M': 1000, 'D': 500, 'C': 100, 'L': 50, 'X': 10, 'V': 5, 'I': 1}
    # ローマ数字とアラビア数字の部分を空文字列に初期化する
    roman_part = ''
    num_part = ''
    # 新しい文字列の各文字についてループする
    for c in s:
        # 文字がローマ数字であれば、ローマ数字の部分に追加する
        if c in roman_dict:
            roman_part += c
        # 文字がアラビア数字であれば、アラビア数字の部分に追加する
        elif c.isdigit():
            num_part += c
        # 文字がどちらでもなければ、エラーを返す
        else:
            return 'Error: invalid character'
    # ローマ数字とアラビア数字の部分をタプルとして返す
    if num_part == '':
        return 'Error: nothing number'    
    return (roman_part, num_part)

def number_replace(classed_json):
    with open(f'graph_attrs/{classed_json}.json', 'r') as file:
        graph_objects = json.load(file)
    with open('graph_attrs/iwanami_trans.json', 'r') as file:
        number_to_str = json.load(file)
    with open('graph_attrs/iwanami_div_trans.json', 'r') as file:
        roman_to_str = json.load(file)

    # ローマ数字とアラビア数字に分け，対応表で置換
    for obj in graph_objects["mml_classification"]:
        if obj.get("directory"):  
            if obj["directory"] == "" :
                continue
            splitSlash = obj["directory"].split("/")
            romanAndNum = splitSlash[1]
            result = split_roman_and_num(romanAndNum)
            if result != 'Error: invalid character':
                roman, num = result
            obj["directory"] = "/"+roman_to_str[roman]+number_to_str[roman][num]

    return graph_objects


if __name__ == '__main__':
    graph_objects = number_replace("mml_classification_1403")
    with open('graph_attrs/mml_classification_1403_replace.json', 'w') as file :
        json.dump(graph_objects, file, indent=4)