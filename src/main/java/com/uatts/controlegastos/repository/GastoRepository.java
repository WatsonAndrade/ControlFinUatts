package com.uatts.controlegastos.repository;

import com.uatts.controlegastos.model.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface GastoRepository extends JpaRepository<Gasto, Long> {
        List<Gasto> findByMesPagamentoIgnoreCase(String mesPagamento);

        @Query("SELECT SUM(g.valor) FROM Gasto g WHERE LOWER(g.mesPagamento) = LOWER(:mes)")
        Optional<Double> sumValorByMes(@Param("mes") String mes);

        @Query("SELECT COALESCE(SUM(g.valor), 0) FROM Gasto g WHERE g.mesNumero = :mes AND g.anoPagamento = :ano")
        double sumValorByMesNumeroEAno(@Param("mes") Integer mes, @Param("ano") Integer ano);

        @Query("SELECT COALESCE(SUM(g.valor), 0) FROM Gasto g WHERE g.mesNumero = :mes AND g.anoPagamento = :ano AND g.pago = true")
        double sumValorPagoByMesNumeroEAno(@Param("mes") Integer mes, @Param("ano") Integer ano);

        @Query("SELECT COUNT(g) FROM Gasto g WHERE g.mesNumero = :mes AND g.anoPagamento = :ano")
        long countByMesNumeroEAno(@Param("mes") Integer mes, @Param("ano") Integer ano);

        @Query("""
                SELECT 
                g.categoria AS categoria,
                COALESCE(SUM(g.valor), 0) AS total,
                COALESCE(SUM(CASE WHEN g.pago = true 
                THEN g.valor ELSE 0 END),0) AS totalPago,
                COUNT(g) AS quantidade
                FROM Gasto g
                WHERE g.mesNumero = :mes AND g.anoPagamento = :ano
                GROUP BY g.categoria
                """)
        List<Object[]> resumoPorCategoria(@Param("mes") Integer mes, @Param("ano") Integer ano);


        List<Gasto> findByMesPagamentoIgnoreCaseAndAnoPagamento(String mesPagamento, Integer anoPagamento);

        List<Gasto> findByMesPagamentoIgnoreCaseAndAnoPagamentoAndPago(String mesPagamento, Integer anoPagamento, boolean pago);

        Page<Gasto> findByMesNumeroAndAnoPagamento(Integer mesNumero, Integer anoPagamento, Pageable pageable);

        Page<Gasto> findByMesNumeroAndAnoPagamentoAndPago(Integer mesNumero, Integer anoPagamento, boolean pago, Pageable pageable);

        List<Gasto> findByMesNumeroIsNullOrMesPagamentoIsNull();

}