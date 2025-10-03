package com.uatts.controlegastos.model;

import com.uatts.controlegastos.listener.GastoListener;
import jakarta.persistence.*;

@Entity
@Table(
        indexes = {
                @Index(name = "idx_gasto_mes_ano", columnList = "mes_numero, ano_pagamento"),
                @Index(name = "idx_gasto_mes_ano_pago", columnList = "mes_numero, ano_pagamento, pago"),
                @Index(name = "idx_gasto_categoria", columnList = "categoria")
        }
)
@EntityListeners(GastoListener.class)
public class Gasto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 12)
    private String mesPagamento;

    private Integer mesNumero;

    @Column(nullable = false)
    private Integer anoPagamento;

    @Column(name = "referente_a", nullable = true, length = 50)
    private String referenteA;

    @Column(nullable = false, length = 50)
    private String categoria;

    @Column(nullable = false)
    private Double valor;

    @Column(nullable = true, length = 255)
    private String descricao;

    @Column
    private boolean pago = false;

    @Column
    private Integer totalParcelas;

    @Column
    private Integer parcelaAtual;

    @Column(name = "user_id", length = 128)
    private String userId;
    // Getters e Setters explícitos (evita depender de Lombok no build)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMesPagamento() { return mesPagamento; }
    public void setMesPagamento(String mesPagamento) { this.mesPagamento = mesPagamento; }

    public Integer getMesNumero() { return mesNumero; }
    public void setMesNumero(Integer mesNumero) { this.mesNumero = mesNumero; }

    public Integer getAnoPagamento() { return anoPagamento; }
    public void setAnoPagamento(Integer anoPagamento) { this.anoPagamento = anoPagamento; }

    public String getReferenteA() { return referenteA; }
    public void setReferenteA(String referenteA) { this.referenteA = referenteA; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public Double getValor() { return valor; }
    public void setValor(Double valor) { this.valor = valor; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public boolean isPago() { return pago; }
    public void setPago(boolean pago) { this.pago = pago; }

    public Integer getTotalParcelas() { return totalParcelas; }
    public void setTotalParcelas(Integer totalParcelas) { this.totalParcelas = totalParcelas; }

    public Integer getParcelaAtual() { return parcelaAtual; }
    public void setParcelaAtual(Integer parcelaAtual) { this.parcelaAtual = parcelaAtual; }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cartao_id")
    private Cartao cartao;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Cartao getCartao() { return cartao; }
    public void setCartao(Cartao cartao) { this.cartao = cartao; }
}
