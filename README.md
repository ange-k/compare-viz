# システム性能比較ダッシュボード

異なるシステムやツールの性能を比較・可視化するためのWebアプリケーションです。

## 特徴

- 📊 **柔軟な比較**: 任意の2つのシステム（A/B）の性能を比較
- 📈 **多様なメトリクス**: スループット、レイテンシー、エラー率など様々な指標に対応
- 🔍 **動的フィルタリング**: パラメータに基づいてデータを絞り込み
- 📱 **レスポンシブデザイン**: PC・タブレット・スマートフォンに対応
- 🌙 **ダークモード対応**: 目に優しい表示切り替え

## 使い方

### 1. 設定ファイルの準備

`public/config.yaml`でダッシュボードの設定を行います：

```yaml
title: システム性能比較ダッシュボード
description: 異なるシステムやツールの性能を比較・可視化

scenarios:
  - id: pulsar-vs-kafka
    name: メッセージングシステム比較
    file: data/pulsar_vs_kafka.csv
    description: Apache Pulsar と Apache Kafka の比較
    target_a_name: Apache Pulsar
    target_b_name: Apache Kafka
    metrics:
      - id: produce_rate
        name: プロデュースレート
        unit: msg/s
        higher_is_better: true
    parameters:
      parameter_1:
        name: プロデューサー数
        unit: instances
```

### 2. データファイルの準備

`public/data/`ディレクトリにCSVファイルを配置します：

```csv
test_condition,producers,consumers,partitions,pulsar_produce_rate,kafka_produce_rate,pulsar_latency_p50,kafka_latency_p50
test-001,1,1,1,10000,9500,5,7
test-002,2,2,4,40000,38000,6,8
```

### 3. カラムマッピングの設定

CSVのカラム名と内部で使用する名前をマッピングします：

```yaml
column_mappings:
  - file: data/pulsar_vs_kafka.csv
    mappings:
      test_condition: test_condition
      parameter_1: producers
      parameter_2: consumers
      parameter_3: partitions
      scenario_a_produce_rate: pulsar_produce_rate
      scenario_b_produce_rate: kafka_produce_rate
```

## 設定項目の詳細

### グローバル設定

| 項目 | 説明 | 必須 |
|------|------|------|
| `title` | ダッシュボードのタイトル | ❌ |
| `description` | ダッシュボードの説明 | ❌ |

### シナリオ設定

| 項目 | 説明 | 必須 |
|------|------|------|
| `id` | シナリオの一意識別子 | ✅ |
| `name` | シナリオの表示名 | ✅ |
| `file` | CSVファイルのパス | ✅ |
| `description` | シナリオの説明 | ✅ |
| `target_a_name` | 比較対象Aの名前 | ✅ |
| `target_b_name` | 比較対象Bの名前 | ✅ |
| `metrics` | メトリクスの配列 | ✅ |
| `parameters` | パラメータの定義 | ✅ |

### メトリクス設定

| 項目 | 説明 | 必須 |
|------|------|------|
| `id` | メトリクスの一意識別子 | ✅ |
| `name` | メトリクスの表示名 | ✅ |
| `unit` | 単位（例: ms, req/s, %） | ✅ |
| `higher_is_better` | 値が高いほど良いか | ✅ |

### パラメータ設定

パラメータは`parameter_1`〜`parameter_3`の3つまで設定可能です：

```yaml
parameters:
  parameter_1:
    name: パラメータの表示名
    unit: 単位
```

## 開発

### 環境構築

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### ビルド

```bash
# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

### テスト

```bash
# 単体テストの実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジレポート
npm run test:coverage
```

## 使用例

### 例1: データベース性能比較

PostgreSQLとMySQLの性能を比較する場合：

1. CSVファイルを準備（`database_comparison.csv`）
2. YAMLでシナリオを定義
3. パラメータとして接続数、スレッド数、クエリ複雑度を設定
4. メトリクスとしてQPS、レイテンシー、エラー率を定義

### 例2: Webサーバー比較

NginxとApacheの性能を比較する場合：

1. 負荷試験の結果をCSVで保存
2. パラメータとして同時接続数、リクエストサイズを設定
3. メトリクスとしてレスポンスタイム、スループットを定義

## トラブルシューティング

### データが表示されない

1. ブラウザの開発者ツールでエラーを確認
2. CSVファイルのパスが正しいか確認
3. カラムマッピングが正しいか確認

### メトリクスが0として表示される

1. CSVのカラム名とマッピングが一致しているか確認
2. 数値データが正しい形式か確認（カンマ区切りなど）

## ライセンス

MIT License