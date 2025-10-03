package com.uatts.controlegastos.dto;

public class PreviewItemDTO {
    private String descricao;
    private String categoria;
    private Double valor;
    private Integer mesNumero;
    private Integer anoPagamento;
    private Integer parcelaAtual;
    private Integer totalParcelas;

    public PreviewItemDTO() {}

    public PreviewItemDTO(String descricao, String categoria, Double valor, Integer mesNumero, Integer anoPagamento,
                          Integer parcelaAtual, Integer totalParcelas) {
        this.descricao = descricao;
        this.categoria = categoria;
        this.valor = valor;
        this.mesNumero = mesNumero;
        this.anoPagamento = anoPagamento;
        this.parcelaAtual = parcelaAtual;
        this.totalParcelas = totalParcelas;
    }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public Double getValor() { return valor; }
    public void setValor(Double valor) { this.valor = valor; }
    public Integer getMesNumero() { return mesNumero; }
    public void setMesNumero(Integer mesNumero) { this.mesNumero = mesNumero; }
    public Integer getAnoPagamento() { return anoPagamento; }
    public void setAnoPagamento(Integer anoPagamento) { this.anoPagamento = anoPagamento; }
    public Integer getParcelaAtual() { return parcelaAtual; }
    public void setParcelaAtual(Integer parcelaAtual) { this.parcelaAtual = parcelaAtual; }
    public Integer getTotalParcelas() { return totalParcelas; }
    public void setTotalParcelas(Integer totalParcelas) { this.totalParcelas = totalParcelas; }
}

