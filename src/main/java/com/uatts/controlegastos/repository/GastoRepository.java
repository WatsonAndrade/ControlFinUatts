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

        @Query("""
                select coalesce(sum(case when g.valor > 0 then g.valor else 0 end), 0)
                from Gasto g
                where g.mesNumero = :mes and g.anoPagamento = :ano
                """)
        double sumValorByMesNumeroEAno(@Param("mes") Integer mes, @Param("ano") Integer ano);

        @Query("""
                select coalesce(sum(case when g.pago = true and g.valor > 0 then g.valor else 0 end), 0)
                from Gasto g
                where g.mesNumero = :mes and g.anoPagamento = :ano
                """)
        double sumValorPagoByMesNumeroEAno(@Param("mes") Integer mes, @Param("ano") Integer ano);

        @Query("""
                select count(g)
                from Gasto g
                where g.mesNumero = :mes and g.anoPagamento = :ano and g.valor > 0
                """)
        long countByMesNumeroEAno(@Param("mes") Integer mes, @Param("ano") Integer ano);

        @Query("""
                select coalesce(g.categoria, 'Sem Categoria') as categoria,
                sum(case when g.valor > 0 then g.valor else 0 end) as total,
                sum(case when g.pago = true and g.valor > 0 then g.valor else 0 end) as totalPago,
                count(case when g.valor > 0 then 1 end) as quantidade
                from Gasto g
                where (:mes is null or g.mesNumero = :mes)
                and (:ano is null or g.anoPagamento = :ano)
                group by coalesce(g.categoria, 'Sem Categoria')
                """)
        List<Object[]> resumoPorCategoria(@Param("mes") Integer mes, @Param("ano") Integer ano);

        List<Gasto> findByMesPagamentoIgnoreCaseAndAnoPagamento(String mesPagamento, Integer anoPagamento);

        List<Gasto> findByMesPagamentoIgnoreCaseAndAnoPagamentoAndPago(String mesPagamento, Integer anoPagamento, boolean pago);

        Page<Gasto> findByMesNumeroAndAnoPagamento(Integer mesNumero, Integer anoPagamento, Pageable pageable);

        Page<Gasto> findByMesNumeroAndAnoPagamentoAndPago(Integer mesNumero, Integer anoPagamento, boolean pago, Pageable pageable);

        List<Gasto> findByMesNumeroIsNullOrMesPagamentoIsNull();

}