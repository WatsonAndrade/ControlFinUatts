package com.uatts.controlegastos.dto;

public class ResumoMensalDTO {
    private Integer mesNumero;
    private Integer anoPagamento;
    private Double total;
    private Double totalPago;
    private Double totalAberto;
    private Long quantidade;

    public ResumoMensalDTO() {}

    public ResumoMensalDTO(Integer mesNumero, Integer anoPagamento, Double total, Double totalPago, Double totalAberto, Long quantidade) {
        this.mesNumero = mesNumero;
        this.anoPagamento = anoPagamento;
        this.total = total;
        this.totalPago = totalPago;
        this.totalAberto = totalAberto;
        this.quantidade = quantidade;
    }

    public Integer getMesNumero() { return mesNumero; }
    public void setMesNumero(Integer mesNumero) { this.mesNumero = mesNumero; }

    public Integer getAnoPagamento() { return anoPagamento; }
    public void setAnoPagamento(Integer anoPagamento) { this.anoPagamento = anoPagamento; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public Double getTotalPago() { return totalPago; }
    public void setTotalPago(Double totalPago) { this.totalPago = totalPago; }

    public Double getTotalAberto() { return totalAberto; }
    public void setTotalAberto(Double totalAberto) { this.totalAberto = totalAberto; }

    public Long getQuantidade() { return quantidade; }
    public void setQuantidade(Long quantidade) { this.quantidade = quantidade; }
}
