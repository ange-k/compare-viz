# 負荷試験データ可視化アプリケーション 要件定義

## 1. プロジェクト概要
- 共通条件のもとで実行された2つの負荷試験シナリオの結果を比較・可視化するWebアプリケーション
- duckDB-wasmを使用してブラウザ上でCSVデータを処理
- GitHub Pagesでホスティング（サーバーサイド処理なし）
- 特定の技術（Pulsar/Kafka等）に依存しない汎用的な比較ツール

## 2. データ構成
### メタデータ管理
- YAMLファイルでシナリオ名とCSVファイルのマッピングを定義
- 各シナリオの説明、表示用のラベル、比較対象のカラムを設定可能

### YAML構造例
```yaml
scenarios:
  - id: "scenario-a-vs-b"
    name: "シナリオA vs シナリオB"
    file: "comparison_results.csv"
    description: "同一環境での2つの実装の性能比較"
    
  - id: "config-comparison"
    name: "設定値による性能比較"
    file: "config_comparison.csv"
    description: "異なる設定値での性能差を比較"

metrics:
  - id: "throughput"
    name: "スループット"
    scenario_a_column: "Scenario A - Throughput"
    scenario_b_column: "Scenario B - Throughput"
    unit: "req/s"
    
  - id: "latency"
    name: "レイテンシー"
    scenario_a_column: "Scenario A - Latency"
    scenario_b_column: "Scenario B - Latency"
    unit: "ms"
    
  - id: "error_rate"
    name: "エラー率"
    scenario_a_column: "Scenario A - Error Rate"
    scenario_b_column: "Scenario B - Error Rate"
    unit: "%"

# カラムマッピング定義（CSVファイルごとの列構造の違いに対応）
column_mappings:
  - file: "comparison_results.csv"
    mappings:
      test_condition: "test_condition"
      parameter_1: "parameter_1"
      parameter_2: "parameter_2"
      parameter_3: "parameter_3"
      scenario_a_throughput: "Scenario A - Throughput"
      scenario_a_latency: "Scenario A - Latency"
      scenario_b_throughput: "Scenario B - Throughput"
      scenario_b_latency: "Scenario B - Latency"
```

### 重要なCSVカラム
- test_condition: テスト条件の識別子
- parameter_1, parameter_2, parameter_3: 可変パラメータ（例：並列数、データサイズ、接続数など）
- Scenario A/B - Throughput: 各シナリオのスループット値
- Scenario A/B - Latency: 各シナリオのレイテンシー値
- Scenario A/B - Error Rate: 各シナリオのエラー率
- start, end: テスト開始・終了時間（オプション）

## 3. データ読み込みと処理フロー
1. アプリ初期化時にYAMLファイルを読み込み
2. シナリオ選択UIを動的生成
3. ユーザーがシナリオを選択したらCSVファイルを読み込み
4. duckDB-wasmでCSVデータを処理・テーブル生成
5. UIのフィルター選択に応じてクエリ実行（SQLはユーザーに非表示）

### データ正規化と変換
- CSVファイル間の列構造の違いをYAMLのマッピング定義で吸収
- 欠損値のある組み合わせは「データなし」として表示
- 列構造の統一化（内部データモデルへの変換）

## 4. UI構成
### シナリオ選択
- YAMLから動的に生成されたシナリオリスト
- 各シナリオの説明も表示

### フィルター
- パラメータ1：CSVから動的に選択肢を生成
- パラメータ2：CSVから動的に選択肢を生成
- パラメータ3：CSVから動的に選択肢を生成
- メトリクス選択（スループット/レイテンシー/エラー率など）

### データ表示
- フィルタリング可能なDataTable
- シナリオA vs シナリオB比較バーチャート
- パラメータの組み合わせによる複数条件比較
- 欠損データがある場合の適切な表示
- 差分・改善率の自動計算と表示

### 複数条件比較
- 最大5つの条件を同時に比較可能
- 条件ごとに色分けされたグラフ表示
- 共通パラメータでのフィルタリング
- トレンド分析（パラメータ変化による性能変化の可視化）

## 5. 技術スタック
- フロントエンド: React + TypeScript + Vite
- UIコンポーネント: shadcn/ui
- データ処理: duckDB-wasm
- 設定ファイル: YAML
- スタイリング: Tailwind CSS
- グラフ描画: shadcn/uiのチャート

## 6. ホスティング
- GitHub Pages（静的ホスティング）
- すべての処理はブラウザで完結

## 7. 非機能要件
- モバイル/タブレット対応のレスポンシブデザイン
  - スマートフォン向けに簡易表示モード
  - タブレット向けにレイアウト最適化
- 軽量で高速な動作（大きなCSVファイルでも処理可能）
  - WebWorkerによる非同期処理
  - 処理中のローディング表示
- 直感的なUI/UX
  - 操作ガイダンスの表示
  - ツールチップでの説明
- オフライン対応（一度読み込んだデータはキャッシュ）
- エラーハンドリング（データ読み込み失敗、処理エラー時の適切なメッセージ表示）

## 8. 将来拡張の可能性
- 追加メトリクスの対応
- 時系列データの可視化
- カスタムクエリ機能（上級ユーザー向け）
- データのエクスポート機能（グラフ画像、処理済みデータ）
- 統計分析機能（標準偏差、信頼区間など）
- 複数のCSVファイルの結合・統合処理