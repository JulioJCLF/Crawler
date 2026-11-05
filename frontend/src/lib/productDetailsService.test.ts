import { describe, it, expect } from "vitest";
import {
  decodeHtmlEntities,
  sanitizeDetailText,
  parseProductDetailsFromHtml,
} from "./productDetailsService";

describe("productDetailsService (REQ-026 / PM-014)", () => {
  it("should decode Portuguese HTML entities accurately", () => {
    expect(
      decodeHtmlEntities(
        "Caracter&iacute;sticas e Especifica&ccedil;&otilde;es em alum&iacute;nio e Pol&iacute;mero"
      )
    ).toBe("Características e Especificações em alumínio e Polímero");
  });

  it("should strip HTML tags, Arsenal Sports branding and origin URLs", () => {
    expect(
      sanitizeDetailText(
        "<p>Rifle <strong>VFC APFG</strong> na Arsenal Sports - https://www.arsenalsports.com/produto/mcx-34272.html</p>"
      )
    ).toBe("Rifle VFC APFG na -");
  });

  it("should extract gallery images, structured description and specs table from product HTML", () => {
    const html = `
      <div class="product-gallery">
        <figure class="product-image">
          <a href="https://www.arsenalsports.com/img/34272/produtos/1200/a.jpg" class="fancybox">
            <img src="https://www.arsenalsports.com/img/34272/produtos/600/a.jpg" data-zoom-image="https://www.arsenalsports.com/img/34272/produtos/1200/a.jpg">
          </a>
        </figure>
        <figure class="product-image">
          <img src="/img/34272/produtos/600/b.jpg">
        </figure>
      </div>
      <div class="tab-pane active in" id="product-tab-description">
        <div class="row mt-6">
          <div class="col-md-12">
            <p><strong>Caracter&iacute;sticas:</strong></p>
            <ul>
              <li>Estilo Rattler LT.</li>
              <li>HandGuard em alum&iacute;nio usinado em CNC.</li>
              <li><strong>ACOMPANHA 03 MAGAZINES EXTRAS. TOTALIZANDO 04 MAGAZINES</strong></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="tab-pane" id="product-tab-additional">
        <table class="table">
          <tbody>
            <tr>
              <th>SKU</th>
              <td>549998</td>
            </tr>
            <tr>
              <th>Código Fabricante</th>
              <td>APFG-S-004BK</td>
            </tr>
            <tr>
              <th>Marca</th>
              <td>VFC</td>
            </tr>
            <tr>
              <th>MATERIAL</th>
              <td>Metal e Pol&iacute;mero</td>
            </tr>
            <tr>
              <th>MARCA</th>
              <td>VFC</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    const details = parseProductDetailsFromHtml(html);

    expect(details.images).toEqual([
      "https://www.arsenalsports.com/img/34272/produtos/1200/a.jpg",
      "https://www.arsenalsports.com/img/34272/produtos/600/b.jpg",
    ]);
    expect(details.sku).toBe("549998");
    expect(details.description).toContain("Características:");
    expect(details.description).toContain("• Estilo Rattler LT.");
    expect(details.description).toContain("• HandGuard em alumínio usinado em CNC.");
    expect(details.description).toContain(
      "• ACOMPANHA 03 MAGAZINES EXTRAS. TOTALIZANDO 04 MAGAZINES"
    );
    expect(details.specs).toEqual({
      SKU: "549998",
      "Código Fabricante": "APFG-S-004BK",
      Marca: "VFC",
      MATERIAL: "Metal e Polímero",
    });
  });
});
