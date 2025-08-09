package com.uatts.controlegastos.listener;

import com.uatts.controlegastos.model.Gasto;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

public class GastoListener {

    @PrePersist
    @PreUpdate
    public void ensureMesAno(Gasto g) {
        // 1) Se mesNumero vier nulo mas mesPagamento (String) existir, tentar parse
        if (g.getMesNumero() == null && g.getMesPagamento() != null) {
            Integer parsed = tryParseMes(g.getMesPagamento());
            if (parsed != null) g.setMesNumero(parsed);
        }

        // 2) Se mesPagamento (String) estiver nulo, derive de mesNumero
        if (g.getMesPagamento() == null && g.getMesNumero() != null) {
            g.setMesPagamento(String.valueOf(g.getMesNumero()));
        }

        // 3) (Opcional) Se quiser travar criação/edição sem anoPagamento:
        //    Por enquanto só garantimos que ele não fique nulo se já vier preenchido na criação.
        //    Se quiser derivar de uma data (ex.: dataPagamento), me diga o nome exato do campo.
        //    Exemplo (DESATIVADO até você confirmar o campo):
        // if (g.getAnoPagamento() == null && g.getDataPagamento() != null) {
        //   g.setAnoPagamento(g.getDataPagamento().toLocalDate().getYear());
        // }
    }

    // Aceita "7", "07", "julho", "Julho", "JUL" etc. (bem básico)
    private Integer tryParseMes(String mesPag) {
        if (mesPag == null) return null;
        String s = mesPag.trim().toLowerCase();

        try {
            int n = Integer.parseInt(s);
            if (n >= 1 && n <= 12) return n;
        } catch (NumberFormatException ignored) {}

        switch (s) {
            case "jan": case "janeiro":   return 1;
            case "fev": case "fevereiro": return 2;
            case "mar": case "marco": case "março": return 3;
            case "abr": case "abril":     return 4;
            case "mai": case "maio":      return 5;
            case "jun": case "junho":     return 6;
            case "jul": case "julho":     return 7;
            case "ago": case "agosto":    return 8;
            case "set": case "setembro":  return 9;
            case "out": case "outubro":   return 10;
            case "nov": case "novembro":  return 11;
            case "dez": case "dezembro":  return 12;
            default: return null;
        }
    }
}
