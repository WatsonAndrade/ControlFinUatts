package com.uatts.controlegastos.repository;

import com.uatts.controlegastos.model.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface GastoRepository extends JpaRepository<Gasto, Long> {
        List<Gasto> findByMesPagamentoIgnoreCase(String mesPagamento);

        @Query("SELECT SUM(g.valor) FROM Gasto g WHERE LOWER(g.mesPagamento) = LOWER(:mes)")
        Optional<Double> sumValorByMes(@Param("mes") String mes);

        List<Gasto> findByMesPagamentoIgnoreCaseAndAnoPagamento(String mesPagamento, Integer anoPagamento);

        List<Gasto> findByMesPagamentoIgnoreCaseAndAnoPagamentoAndPago(String mesPagamento, Integer anoPagamento, boolean pago);
}