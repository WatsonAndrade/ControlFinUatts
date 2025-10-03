package com.uatts.controlegastos.dto;

public class CategoriaResumoDTO {
    private String categoria;
    private Double total;        // soma de todos os gastos da categoria
    private Double totalPago;    // soma dos pagos
    private Double totalAberto;  // total - totalPago
    private Long quantidade;     // quantos lançamentos na categoria

    public CategoriaResumoDTO() {}

    public CategoriaResumoDTO(String categoria, Double total, Double totalPago, Double totalAberto, Long quantidade) {
        this.categoria = categoria;
        this.total = total;
        this.totalPago = totalPago;
        this.totalAberto = totalAberto;
        this.quantidade = quantidade;
    }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public Double getTotalPago() { return totalPago; }
    public void setTotalPago(Double totalPago) { this.totalPago = totalPago; }

    public Double getTotalAberto() { return totalAberto; }
    public void setTotalAberto(Double totalAberto) { this.totalAberto = totalAberto; }

    public Long getQuantidade() { return quantidade; }
    public void setQuantidade(Long quantidade) { this.quantidade = quantidade; }
}
