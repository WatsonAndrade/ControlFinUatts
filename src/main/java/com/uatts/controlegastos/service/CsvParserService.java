package com.uatts.controlegastos.service;

import com.uatts.controlegastos.model.Gasto;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.StringReader;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CsvParserService {

    // dia de fechamento da fatura (ex.: fecha dia 3)
    private static final int DIA_FECHAMENTO = 3;

    // detecta "Parcela X/Y"
    private static final Pattern PARCELA_PATTERN = Pattern.compile("(?i)\\bparcela\\s*(\\d+)\\/(\\d+)\\b");

    // textos que não devem virar despesa
    private static final String[] IGNORAR_TITULOS = new String[]{
            "pagamento recebido",
            "encerramento de dívida",
            "encerramento de divida",
            "juros de dívida encerrada",
            "juros de divida encerrada"
    };

    private static final DateTimeFormatter ISO = DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.ROOT);

    public List<Gasto> parse(String csvText) {
        List<Gasto> gastos = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new StringReader(csvText))) {
            String line;
            boolean header = true;

            while ((line = br.readLine()) != null) {
                if (header) { // pula o cabeçalho: date,title,amount
                    header = false;
                    continue;
                }

                if (line.isBlank()) continue;

                // divide em 3 colunas no máximo (protege títulos com vírgulas)
                String[] cols = line.split(",", 3);
                if (cols.length < 3) continue;

                String dateStr   = cols[0].trim();          // yyyy-MM-dd
                String titleOrig = cols[1].trim();          // título/descrição
                String amountStr = cols[2].trim();          // valor (pode vir com vírgula/ponto)

                // 1) ignorar linhas por texto
                if (deveIgnorarPorTitulo(titleOrig)) continue;

                // 2) valor: ignorar não-despesa (<= 0)
                double valor;
                try {
                    valor = Double.parseDouble(amountStr.replace(",", "."));
                } catch (NumberFormatException e) {
                    continue; // linha malformada
                }
                if (valor <= 0.0) continue;

                // 3) data da compra e mês/ano de competência (regra do fechamento)
                LocalDate compra;
                try {
                    compra = LocalDate.parse(dateStr, ISO);
                } catch (Exception e) {
                    continue; // data inválida
                }
                LocalDate competenciaBase = calcularCompetencia(compra, DIA_FECHAMENTO);

                // 4) parcelas
                Integer parcelaAtual = null;
                Integer totalParcelas = null;
                String descricao = titleOrig;

                Matcher m = PARCELA_PATTERN.matcher(titleOrig);
                if (m.find()) {
                    parcelaAtual = Integer.parseInt(m.group(1));
                    totalParcelas = Integer.parseInt(m.group(2));
                    // remove " - Parcela X/Y" do texto (se existir nesse formato)
                    descricao = titleOrig.replaceAll("(?i)\\s*-\\s*Parcela\\s*\\d+\\/\\d+\\s*", "").trim();

                    for (int p = parcelaAtual; p <= totalParcelas; p++) {
                        LocalDate comp = competenciaBase.plusMonths(p - parcelaAtual);
                        gastos.add(novoGasto(descricao, valor, comp, p, totalParcelas));
                    }
                } else {
                    // não parcelado → 1 lançamento no mês de competência calculado
                    gastos.add(novoGasto(descricao, valor, competenciaBase, null, null));
                }
            }
        } catch (Exception ignore) {
            // se quiser, logar aqui
        }

        return gastos;
    }

    /** Regra do fechamento: se dia < fechamento → mesmo mês; senão → mês seguinte. */
    private static LocalDate calcularCompetencia(LocalDate compra, int diaFechamento) {
        if (compra.getDayOfMonth() < diaFechamento) {
            return compra.withDayOfMonth(1);           // mesmo mês
        } else {
            return compra.plusMonths(1).withDayOfMonth(1); // mês seguinte
        }
    }

    private static boolean deveIgnorarPorTitulo(String title) {
        String t = title.toLowerCase(Locale.ROOT);
        for (String s : IGNORAR_TITULOS) {
            if (t.contains(s)) return true;
        }
        return false;
    }

    private static Gasto novoGasto(String descricao, double valor, LocalDate competencia,
                                   Integer parcelaAtual, Integer totalParcelas) {
        Gasto g = new Gasto();
        int mes = competencia.getMonthValue();
        int ano = competencia.getYear();

        g.setAnoPagamento(ano);
        g.setMesNumero(mes);
        g.setMesPagamento(String.valueOf(mes)); // padroniza como número
        g.setCategoria("Importado");
        g.setDescricao(descricao);
        g.setValor(valor);
        g.setPago(false);
        g.setParcelaAtual(parcelaAtual);
        g.setTotalParcelas(totalParcelas);
        g.setReferenteA("Pessoal");

        return g;
    }
}