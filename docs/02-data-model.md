# 02 - Modelo de Dados

O banco de dados do sistema funciona no modelo "snapshot-based", utilizando um arquivo `.json` estático local (`snapshot.json`). O arquivo de tipos base da aplicação reside em `src/types.ts`.

## `Snapshot`
O nó raiz armazenado a cada finalização do ciclo.

```typescript
export interface Snapshot {
  updatedAt: string;          // ISO string do momento em que o snapshot foi salvo
  count: number;              // Quantidade total de produtos únicos rastreados
  categories: CategorySummary[]; 
  products: Product[];        // Array principal de produtos
}
```

### `CategorySummary`
Métrica consolidada guardada no snapshot para fins de monitoramento rápido.
- `slug`: ID/slug da categoria.
- `label`: Nome de exibição.
- `count`: Total de itens encontrados nessa categoria durante a execução.

---

## Entidade `Product`
Representa um item do site após extração e cálculo de histórico.

| Propriedade | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `string` | ID único extraído da URL (ex: `12345` a partir de `produto-12345.html`). Chave primária de histórico. |
| `sku` | `string` (opcional) | SKU / Referência oficial do produto (ex: `329859` capturado de `Ref.: 329859`). |
| `name` | `string` | Título / Nome da peça ou réplica. |
| `url` | `string` | URL canônica e absoluta do produto. |
| `price` | `string \| null` | Preço atual, extraído (ex: `USD 150.00`). É nulo caso esteja "Sob Consulta". |
| `image` | `string \| null` | URL absoluta da imagem principal do produto. |
| `category` | `string` | Slug da categoria atribuída (`config.ts`). |
| `categoryLabel` | `string` | Nome descritivo da categoria. |
| `firstSeen` | `string` (opcional) | Data ISO em que o scraper detectou o item pela 1ª vez. |
| `priceChangedAt` | `string` (opcional) | Data ISO da última modificação de estado de preço/estoque. |
| `changeType` | `enum` (opcional) | Tipo de alteração ocorrida na última execução que acionou essa tag. Pode ser: `restock`, `sob_consulta`, `price_change`, `new`. |
| `previousPrice` | `string \| null` | Qual era o preço na execução imediatamente anterior à mudança. |
| `priceHistory` | `PricePoint[]` | Histórico temporal. |
| `description` | `string` (opcional) | Descrição técnica estruturada extraída de `#product-tab-description` e sanitizada sem menções ao fornecedor. |
| `specs` | `Record<string, string>` (opcional) | Tabela de especificações técnicas extraída de `#product-tab-additional` (ex: SKU, Código Fabricante, Marca, Comprimento, Peso, Calibre, Hop-Up, Material). |
| `images` | `string[]` (opcional) | Lista de URLs absolutas das imagens de alta resolução da galeria do equipamento (`figure.product-image`). |

### `PricePoint`
Usado para montar gráficos ou rastreabilidade de inflação/deflação ao longo do tempo.
```typescript
export interface PricePoint {
  date: string;          // Data ISO da alteração ou captura
  price: string | null;  // Qual foi o preço setado neste dia
}
```
