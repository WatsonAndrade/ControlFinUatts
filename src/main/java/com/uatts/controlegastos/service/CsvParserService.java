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

    // Trata campo CSV possivelmente entre aspas e com aspas duplas escapadas
    private static String limparCampoCsv(String s) {
        if (s == null) return "";
        String t = s.trim();
        if (t.length() >= 2 && t.charAt(0) == '"' && t.charAt(t.length() - 1) == '"') {
            t = t.substring(1, t.length() - 1);
        }
        // converte aspas duplas CSV ("") em aspas simples (")
        t = t.replace("" + '"' + '"', "\"");
        return t;
    }

    public List<Gasto> parse(String csvText) {
        List<Gasto> gastos = new ArrayList<>();
        // mapa de reembolsos (estornos/cancelamentos) por descricao normalizada
        java.util.Map<String, java.util.List<Double>> reembolsos = prepararReembolsos(csvText);

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
                String titleOrig = limparCampoCsv(cols[1]);          // título/descrição
                String amountStr = limparCampoCsv(cols[2]);          // valor (pode vir com vírgula/ponto)

                // 1) ignorar linhas por texto
                if (deveIgnorarPorTitulo(titleOrig)) continue;

                // 2) valor
                double valor;
                try {
                    valor = Double.parseDouble(amountStr.replace(",", "."));
                } catch (NumberFormatException e) {
                    continue; // linha malformada
                }
                // ignora linhas negativas (reembolsos) e não-despesas
                if (valor <= 0.0) continue;

                // Se existir reembolso correspondente para esta compra e valor, ignora a compra
                String chaveCompra = normalizarDescricaoBase(titleOrig);
                java.util.List<Double> lista = reembolsos.get(chaveCompra);
                if (lista != null && !lista.isEmpty()) {
                    int idx = findAmountIndex(lista, valor);
                    if (idx >= 0) {
                        lista.remove(idx);
                        if (lista.isEmpty()) reembolsos.remove(chaveCompra);
                        continue; // compra cancelada/estornada
                    }
                }

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

    // Constrói um índice de reembolsos (estornos/cancelamentos) por descrição normalizada
    private static java.util.Map<String, java.util.List<Double>> prepararReembolsos(String csvText) {
        java.util.Map<String, java.util.List<Double>> map = new java.util.HashMap<>();
        try (BufferedReader br = new BufferedReader(new StringReader(csvText))) {
            String line; boolean header = true;
            while ((line = br.readLine()) != null) {
                if (header) { header = false; continue; }
                if (line.isBlank()) continue;
                String[] cols = line.split(",", 3);
                if (cols.length < 3) continue;
                String titleOrig = limparCampoCsv(cols[1]);
                String amountStr = limparCampoCsv(cols[2]);

                // apenas linhas com palavras-chave e valor negativo
                if (!contemEstornoOuCancelamento(titleOrig)) continue;
                double valor;
                try { valor = Double.parseDouble(amountStr.replace(",", ".")); }
                catch (NumberFormatException e) { continue; }
                if (valor >= 0.0) continue;

                // tenta extrair a descrição alvo do reembolso; senão, usa o próprio título
                String alvo = extrairDescricaoAlvoReembolso(titleOrig);
                String chave = normalizarDescricaoBase(alvo != null ? alvo : titleOrig);
                map.computeIfAbsent(chave, k -> new java.util.ArrayList<>()).add(Math.abs(valor));
            }
        } catch (Exception ignore) {}
        return map;
    }

    private static boolean contemEstornoOuCancelamento(String title) {
        String t = title == null ? "" : title.toLowerCase(Locale.ROOT);
        return t.contains("estorno") ||
               t.contains("cancelamento") ||
               t.contains("cancelada") ||
               t.contains("cancelado") ||
               t.contains("compra cancelada") ||
               t.contains("reversao");
    }

    private static String extrairDescricaoAlvoReembolso(String title) {
        if (title == null) return null;
        // Estorno de "Descrição"
        Matcher m = Pattern.compile("(?i)estorno\\s+de\\s+\"([^\"]+)\"").matcher(title);
        if (m.find()) return m.group(1).trim();
        // Estorno de Descrição
        m = Pattern.compile("(?i)estorno\\s+de\\s+(.+)").matcher(title);
        if (m.find()) return m.group(1).trim();
        // Cancelamento de "Descrição"
        m = Pattern.compile("(?i)cancelamento\\s+de\\s+\"([^\"]+)\"").matcher(title);
        if (m.find()) return m.group(1).trim();
        // Cancelamento de Descrição
        m = Pattern.compile("(?i)cancelamento\\s+de\\s+(.+)").matcher(title);
        if (m.find()) return m.group(1).trim();
        // Compra cancelada: Descrição (ou com hífen)
        m = Pattern.compile("(?i)compra\\s+cancelada\\s*[:\\-]?\\s*(.+)").matcher(title);
        if (m.find()) return m.group(1).trim();
        return null;
    }

    private static String normalizarDescricaoBase(String title) {
        if (title == null) return "";
        String semParcela = title.replaceAll("(?i)\\s*-\\s*Parcela\\s*\\d+\\/\\d+\\s*", " ");
        String s = semParcela.toLowerCase(Locale.ROOT).trim();
        s = s.replace('"', ' ').replace('\'', ' ');
        s = s.replaceAll("\\s+", " ");
        return s;
    }

    private static int findAmountIndex(java.util.List<Double> valores, double alvo) {
        for (int i = 0; i < valores.size(); i++) {
            if (equalsTol(valores.get(i), alvo, 0.01)) return i;
        }
        return -1;
    }

    private static boolean equalsTol(double a, double b, double tol) {
        return Math.abs(a - b) <= tol;
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
