import { Empty, Skeleton, Tag, Typography } from "antd";
import type { Dayjs } from "dayjs";
import type { ObrigacaoDto } from "../../../api/types";
import {
  formatDateKeyLong,
  formatMonthTitle,
  groupByVencimento,
  isAnual
} from "../calendarioPresentation";
import { ObrigacaoAgendaCard } from "./ObrigacaoAgendaCard";

interface CalendarioCompetenciaViewProps {
  data: ObrigacaoDto[];
  loading: boolean;
  month: Dayjs;
  onRegistrarEntrega: (obrigacao: ObrigacaoDto) => void;
}

export function CalendarioCompetenciaView({
  data,
  loading,
  month,
  onRegistrarEntrega
}: CalendarioCompetenciaViewProps) {
  const groups = Object.entries(groupByVencimento(data));
  const annualCount = data.filter(isAnual).length;

  return (
    <section className="panel competencia-workspace">
      <div className="calendar-section-header">
        <div>
          <Typography.Title level={4}>Competencia {formatMonthTitle(month)}</Typography.Title>
          <Typography.Text type="secondary">
            Origem fiscal das obrigacoes, com vencimento real destacado.
          </Typography.Text>
        </div>

        <div className="competencia-tags">
          <Tag color="blue">{data.length} obrigacao(s)</Tag>
          {annualCount > 0 && <Tag color="cyan">{annualCount} anual(is)</Tag>}
        </div>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 7 }} />
      ) : groups.length === 0 ? (
        <Empty description="Nenhuma obrigacao nessa competencia" />
      ) : (
        <div className="competencia-timeline">
          {groups.map(([dateKey, items]) => (
            <div className="competencia-group" key={dateKey}>
              <div className="competencia-date-marker">
                <Typography.Text strong>{formatDateKeyLong(dateKey)}</Typography.Text>
                <Typography.Text type="secondary">{items.length} item(ns)</Typography.Text>
              </div>

              <div className="calendar-agenda-list">
                {items.map((item) => (
                  <ObrigacaoAgendaCard
                    key={item.id}
                    obrigacao={item}
                    onRegistrarEntrega={onRegistrarEntrega}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
