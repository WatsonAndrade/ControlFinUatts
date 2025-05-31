package com.uatts.controlegastos.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Receita {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String mes;

    private String descricao;

    @Column(nullable = false)
    private Double valor;
}