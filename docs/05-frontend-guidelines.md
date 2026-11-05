# Diretrizes de Frontend (UI/UX)

Este documento estabelece as regras básicas e componentes obrigatórios para o desenvolvimento e manutenção do Frontend do sistema, assegurando que requisitos críticos não se percam em refatorações futuras.

## 1. Responsividade e Imagens (Mobile-Friendly)
A experiência móvel é prioritária.
- **Tamanho de Imagens**: Os containers de imagens de produtos nunca devem usar `aspect-square` irrestrito que os faça gigantes em telas pequenas.
- **Padrão**: Usar alturas fixas relativas (ex: `h-48 md:h-52`) com `object-contain` para garantir que as imagens fiquem harmônicas tanto no celular quanto no desktop. 
- **Adaptação**: Sempre testar a interface em larguras menores que `768px`.

## 2. Componentes Críticos e Conversão (CTAs)
O sistema tem um fim comercial claro. Refatorações estruturais ou mudanças de Tema (White-label) **nunca** devem remover os botões de ação ("Call to Action") primários.

Todo "Product Card" deve possuir **obrigatoriamente**:
- **Preço**: Destacado, com formatação monetária (se disponível). Preços antigos devem constar tachados para gerar senso de oportunidade.
- **Botão de WhatsApp / Pedido Direto**: Um botão ("Pedir via WhatsApp") que adiciona 1 unidade do produto ao carrinho e abre a gaveta do carrinho para o cliente escolher o vendedor e enviar o pedido via WhatsApp (`https://wa.me/...`) com Nome do Produto, Código de Referência (Ref), Quantidade e Preço Listado.
- **Botão de Carrinho (+ Carrinho)**: Opção de selecionar o item para montar um orçamento ou compra massiva. No drawer do carrinho (`FloatingCart`), o cliente pode escolher para qual vendedor (`siteConfig.whatsappSellers`) deseja enviar o orçamento antes de finalizar.
- **Subtotal no Carrinho**: O drawer do carrinho deve exibir a soma monetária de todos os itens considerando suas quantidades, transmitindo o valor total na mensagem enviada ao WhatsApp.
- **Blindagem contra links de fornecedor**: Nenhum link para o site de origem do fornecedor (Arsenal Sports) deve ser exposto na vitrine, nos títulos dos produtos ou nas mensagens de WhatsApp.
- **Página de Detalhes do Equipamento (`/produto/[id]`)**: Clicar na imagem ou no título do `ProductCard` leva à página interna do equipamento, que replica a galeria de imagens, a descrição completa e a tabela de especificações técnicas extraídas pelo crawler, mantendo obrigatoriamente o preço em reais (`R$`) e os botões `Pedir via WhatsApp` e `+ Carrinho`.

## 3. Identidade Tática (Sistema de Temas)
A base visual é dividida via `ThemeProvider.tsx`.
- Fontes OBRIGATÓRIAS (Tema Hunting/Tático): `Saira Condensed` (Headings) e `Space Mono` (Preços, Refs e Metadados).
- Não dependa de cores estáticas (`bg-[#0b0d0c]`), use **sempre** as variáveis globais (`bg-background`, `text-accent`) para garantir que os temas customizados não quebrem a aplicação.
