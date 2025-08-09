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

    private Integer tryParseMes(String mesPag) {
        if (mesPag == null) return null;
        String s = mesPag.trim().toLowerCase();

        // número "7" ou "07"
        try {
            int n = Integer.parseInt(s);
            if (n >= 1 && n <= 12) return n;
        } catch (NumberFormatException ignored) {}

        // nomes pt-BR e EN (abreviados e completos)
        switch (s) {
            // 1
            case "jan": case "janeiro": case "january": return 1;
            // 2
            case "fev": case "fevereiro": case "feb": case "february": return 2;
            // 3
            case "mar": case "marco": case "março": case "march": return 3;
            // 4
            case "abr": case "abril": case "apr": case "april": return 4;
            // 5
            case "mai": case "maio": case "may": return 5;
            // 6
            case "jun": case "junho": case "june": return 6;
            // 7
            case "jul": case "julho": case "july": return 7;
            // 8
            case "ago": case "agosto": case "aug": case "august": return 8;
            // 9
            case "set": case "setembro": case "sep": case "september": return 9;
            // 10
            case "out": case "outubro": case "oct": case "october": return 10;
            // 11
            case "nov": case "novembro": case "november": return 11;
            // 12
            case "dez": case "dezembro": case "dec": case "december": return 12;

            default: return null;
        }
    }
}
