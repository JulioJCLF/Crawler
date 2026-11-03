import { CartItem } from "@/providers/CartProvider";
import { cleanProductName } from "@/lib/cleanUtils";

/**
 * Monta a URL do WhatsApp (`https://wa.me/...`) com o orçamento completo do carrinho
 * direcionada para o número do vendedor selecionado.
 */
export function buildCartWhatsAppUrl(
  items: CartItem[],
  totalItems: number,
  sellerNumber: string,
  subtotalFormatted?: string
): string {
  const cleanNumber = sellerNumber.replace(/\D/g, "");
  let msg = `*NOVO ORÇAMENTO/PEDIDO*\n\n`;
  items.forEach((item, index) => {
    const cleanName = cleanProductName(item.product.name);
    msg += `${index + 1}. ${cleanName}\n`;
    const productRef = item.product.sku || item.product.id;
    msg += `   Ref: ${productRef}\n`;
    msg += `   Qtd: ${item.quantity}\n`;
    msg += `   Preço Listado: ${item.product.price || "Sob consulta"}\n\n`;
  });
  msg += `Total de Itens: ${totalItems}`;
  if (subtotalFormatted) {
    msg += `\nSubtotal: ${subtotalFormatted}`;
  }

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
}
