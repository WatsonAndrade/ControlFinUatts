package com.uatts.controlegastos.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table
public class Gasto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String mesPagamento;

    @Column(nullable = false)
    private Integer anoPagamento; // <- NOVO

    @Column(nullable = false)
    private String referenteA; // <- NOVO

    @Column(nullable = false)
    private String categoria;

    @Column(nullable = false)
    private Double valor;

    private String descricao;

    @Column
    private boolean pago = false;

    @Column
    private Integer totalParcelas;

    @Column
    private Integer parcelaAtual;
}