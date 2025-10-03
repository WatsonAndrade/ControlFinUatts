package com.uatts.controlegastos.dto;

import java.util.List;

public class PreviewResponseDTO {
    private int totalLidas;
    private int importadas;
    private int ignoradas;
    private List<ResumoMensalDTO> resumoMeses;
    private List<CategoriaResumoDTO> resumoCategorias;
    private Double totalValor;
    private Long qtdAvista;
    private Long qtdParcelados;
    private List<PreviewItemDTO> topItens;

    public PreviewResponseDTO() {}

    public PreviewResponseDTO(int totalLidas, int importadas, int ignoradas,
                              List<ResumoMensalDTO> resumoMeses,
                              List<CategoriaResumoDTO> resumoCategorias,
                              Double totalValor,
                              Long qtdAvista,
                              Long qtdParcelados,
                              List<PreviewItemDTO> topItens) {
        this.totalLidas = totalLidas;
        this.importadas = importadas;
        this.ignoradas = ignoradas;
        this.resumoMeses = resumoMeses;
        this.resumoCategorias = resumoCategorias;
        this.totalValor = totalValor;
        this.qtdAvista = qtdAvista;
        this.qtdParcelados = qtdParcelados;
        this.topItens = topItens;
    }

    public int getTotalLidas() { return totalLidas; }
    public void setTotalLidas(int totalLidas) { this.totalLidas = totalLidas; }

    public int getImportadas() { return importadas; }
    public void setImportadas(int importadas) { this.importadas = importadas; }

    public int getIgnoradas() { return ignoradas; }
    public void setIgnoradas(int ignoradas) { this.ignoradas = ignoradas; }

    public List<ResumoMensalDTO> getResumoMeses() { return resumoMeses; }
    public void setResumoMeses(List<ResumoMensalDTO> resumoMeses) { this.resumoMeses = resumoMeses; }

    public List<CategoriaResumoDTO> getResumoCategorias() { return resumoCategorias; }
    public void setResumoCategorias(List<CategoriaResumoDTO> resumoCategorias) { this.resumoCategorias = resumoCategorias; }

    public Double getTotalValor() { return totalValor; }
    public void setTotalValor(Double totalValor) { this.totalValor = totalValor; }

    public Long getQtdAvista() { return qtdAvista; }
    public void setQtdAvista(Long qtdAvista) { this.qtdAvista = qtdAvista; }

    public Long getQtdParcelados() { return qtdParcelados; }
    public void setQtdParcelados(Long qtdParcelados) { this.qtdParcelados = qtdParcelados; }

    public List<PreviewItemDTO> getTopItens() { return topItens; }
    public void setTopItens(List<PreviewItemDTO> topItens) { this.topItens = topItens; }
}
