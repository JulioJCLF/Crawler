import { CartItem } from "@/providers/CartProvider";
import { cleanProductName } from "@/lib/cleanUtils";

/**
 * Monta a URL do WhatsApp (`https://wa.me/...`) com o orçamento completo do carrinho
 * direcionada para o número do vendedor selecionado.
 */
export function buildCartWhatsAppUrl(
  items: CartItem[],
  totalItems: number,
  sellerNumber: string
): string {
  const cleanNumber = sellerNumber.replace(/\D/g, "");
  let msg = `*NOVO ORÇAMENTO/PEDIDO*\n\n`;
  items.forEach((item, index) => {
    const cleanName = cleanProductName(item.product.name);
    msg += `${index + 1}. ${cleanName}\n`;
    msg += `   Ref: ${item.product.id}\n`;
    msg += `   Qtd: ${item.quantity}\n`;
    msg += `   Preço Listado: ${item.product.price || "Sob consulta"}\n\n`;
  });
  msg += `Total de Itens: ${totalItems}`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
}
