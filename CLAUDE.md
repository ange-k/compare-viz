# 開発方針とルール

## プロジェクト概要
負荷試験データ可視化アプリケーション - 2つの負荷試験シナリオの結果を比較・可視化するWebアプリケーション

## 開発方針

### 1. テスト駆動開発 (TDD)
- **Red-Green-Refactorサイクルの厳守**
  - Red: 失敗するテストを先に書く
  - Green: テストを通す最小限の実装
  - Refactor: コードの品質を改善
- **テストファースト**: 実装前に必ずテストを書く
- **カバレッジ目標**: 80%以上を維持

### 2. 型安全性
- **TypeScriptの厳格モード**: strict: true
- **any型の使用禁止**: unknown型を使用
- **型推論の活用**: 明示的な型定義は必要最小限に
- **型ガードの実装**: ランタイムエラーを防ぐ

### 3. 関数型プログラミング
- **純粋関数の優先**: 副作用を最小限に
- **イミュータブルなデータ構造**: データの不変性を保つ
- **関数の合成**: 小さな関数を組み合わせる
- **早期リターン**: ネストを避ける

### 4. アーキテクチャ
- **レイヤー分離**:
  - データ層: CSV/YAML読み込み、DuckDB処理
  - ビジネスロジック層: データ変換、集計、フィルタリング
  - プレゼンテーション層: React コンポーネント
- **単一責任の原則**: 各モジュール/関数は1つの責任のみ
- **依存性の注入**: テストしやすい設計

## コーディングルール

### ファイル構成
```
src/
├── types/          # 型定義
├── utils/          # ユーティリティ関数
├── services/       # ビジネスロジック
├── components/     # UIコンポーネント
├── hooks/          # カスタムフック
└── __tests__/      # テストファイル
```

### 命名規則
- **ファイル名**: kebab-case (例: data-loader.ts)
- **コンポーネント**: PascalCase (例: DataTable.tsx)
- **関数**: camelCase (例: loadCsvData)
- **定数**: UPPER_SNAKE_CASE (例: MAX_RETRY_COUNT)
- **型/インターフェース**: PascalCase with prefix (例: IDataModel, TFilterOption)

### テストファイル
- **配置**: `__tests__`ディレクトリまたは同階層に`.test.ts`
- **命名**: `{対象ファイル名}.test.ts`
- **構造**: 
  ```typescript
  describe('機能名', () => {
    describe('関数名', () => {
      it('期待される動作', () => {
        // Arrange
        // Act
        // Assert
      });
    });
  });
  ```

### コンポーネント設計
- **関数コンポーネントのみ使用**
- **カスタムフックでロジックを分離**
- **Props型定義は必須**
- **メモ化の適切な使用**: React.memo, useMemo, useCallback

### エラーハンドリング
- **Result型パターンの使用**:
  ```typescript
  type Result<T, E = Error> = 
    | { success: true; data: T }
    | { success: false; error: E };
  ```
- **エラーバウンダリーの実装**
- **ユーザーフレンドリーなエラーメッセージ**

### パフォーマンス
- **遅延読み込み**: 大きなデータは必要時のみ
- **WebWorkerの活用**: 重い処理はメインスレッドから分離
- **仮想スクロール**: 大量データの表示時
- **デバウンス/スロットル**: ユーザー入力の最適化

## 品質チェック

### コミット前チェックリスト
- [ ] テストがすべて通る: `npm test`
- [ ] 型チェックが通る: `npm run typecheck`
- [ ] リンターエラーなし: `npm run lint`
- [ ] フォーマット済み: `npm run format`

### PRチェックリスト
- [ ] テストカバレッジ80%以上
- [ ] パフォーマンステスト実施
- [ ] レスポンシブデザイン確認
- [ ] アクセシビリティチェック

## 使用するライブラリとツール

### コア
- React 18+
- TypeScript 5+
- Vite 5+
- DuckDB-WASM

### UI
- shadcn/ui
- Tailwind CSS
- Recharts (shadcn/ui チャート)

### テスト
- Vitest (単体テスト)
- @testing-library/react (コンポーネントテスト)
- Playwright (E2Eテスト)

### 開発ツール
- ESLint
- Prettier
- Husky (Git hooks)

## Git運用

### ブランチ戦略
- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `fix/*`: バグ修正

### コミットメッセージ
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- feat: 新機能
- fix: バグ修正
- docs: ドキュメント
- style: フォーマット
- refactor: リファクタリング
- test: テスト
- chore: ビルド/ツール

## セキュリティ

- **入力値検証**: すべてのユーザー入力を検証
- **XSS対策**: Reactのデフォルト機能を活用
- **依存関係の定期更新**: npm audit定期実行
- **機密情報の排除**: APIキーなどは環境変数

## アクセシビリティ

- **WAI-ARIA準拠**
- **キーボード操作完全対応**
- **スクリーンリーダー対応**
- **色覚多様性への配慮**

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# テスト実行
npm test

# テスト（ウォッチモード）
npm run test:watch

# 型チェック
npm run typecheck

# リント
npm run lint

# フォーマット
npm run format

# ビルド
npm run build

# プレビュー
npm run preview
```