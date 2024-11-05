#!/bin/bash

# 作業ディレクトリを設定
REPO_DIR=$(pwd)
SOURCE_DIR="$REPO_DIR/compound_graph"
TARGET_DIR="$REPO_DIR/docs"

# docs ディレクトリをクリア（過去のファイルを削除）
rm -rf "$TARGET_DIR"/*
mkdir -p "$TARGET_DIR"

# compound_graph 内のファイルを docs にコピー
cp -R "$SOURCE_DIR"/* "$TARGET_DIR"
