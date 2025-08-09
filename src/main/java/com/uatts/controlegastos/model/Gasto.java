package com.uatts.controlegastos.model;

import com.uatts.controlegastos.listener.GastoListener;
import jakarta.persistence.*;
import lombok.Data;

@Data
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
}