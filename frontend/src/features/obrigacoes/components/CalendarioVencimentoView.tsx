import { Empty, Skeleton, Typography } from "antd";
import type { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import type { ObrigacaoDto } from "../../../api/types";
import { labelTipo } from "../../../shared/utils/domain";
import {
  buildMonthDays,
  formatDateKeyLong,
  formatMonthTitle,
  groupByVencimento,
  initialSelectedDateKey,
  urgencyTone
} from "../calendarioPresentation";
import { ObrigacaoAgendaCard } from "./ObrigacaoAgendaCard";

interface CalendarioVencimentoViewProps {
  data: ObrigacaoDto[];
  loading: boolean;
  month: Dayjs;
  onRegistrarEntrega: (obrigacao: ObrigacaoDto) => void;
}

const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export function CalendarioVencimentoView({
  data,
  loading,
  month,
  onRegistrarEntrega
}: CalendarioVencimentoViewProps) {
  const grouped = useMemo(() => groupByVencimento(data), [data]);
  const days = useMemo(() => buildMonthDays(month), [month]);
  const defaultDateKey = useMemo(() => initialSelectedDateKey(data, month), [data, month]);
  const [selectedDateKey, setSelectedDateKey] = useState(defaultDateKey);

  useEffect(() => {
    setSelectedDateKey(defaultDateKey);
  }, [defaultDateKey]);

  const selectedItems = grouped[selectedDateKey] ?? [];

  return (
    <section className="panel calendar-workspace">
      <div className="calendar-month-area">
        <div className="calendar-section-header">
          <div>
            <Typography.Title level={4}>{formatMonthTitle(month)}</Typography.Title>
            <Typography.Text type="secondary">{data.length} vencimento(s) no periodo</Typography.Text>
          </div>
        </div>

        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <div className="calendar-month-grid" role="grid" aria-label="Calendario de vencimentos">
            {weekdays.map((weekday) => (
              <div className="calendar-weekday" key={weekday}>
                {weekday}
              </div>
            ))}

            {days.map((day) => {
              const dateKey = day.format("YYYY-MM-DD");
              const items = grouped[dateKey] ?? [];
              const visibleItems = items.slice(0, 3);
              const selected = dateKey === selectedDateKey;

              return (
                <button
                  className={buildDayClass(items, selected, day.isSame(month, "month"))}
                  key={dateKey}
                  type="button"
                  aria-label={`${day.format("DD/MM/YYYY")} - ${items.length} vencimento(s)`}
                  onClick={() => setSelectedDateKey(dateKey)}
                >
                  <span className="calendar-day-number">{day.date()}</span>

                  <span className="calendar-day-items">
                    {visibleItems.map((item) => (
                      <span className={`calendar-event-chip tone-${urgencyTone(item)}`} key={item.id}>
                        {labelTipo(item.tipo)}
                      </span>
                    ))}
                    {items.length > visibleItems.length && (
                      <span className="calendar-more-chip">+{items.length - visibleItems.length}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <aside className="calendar-day-panel" aria-label="Agenda do dia selecionado">
        <div className="calendar-section-header">
          <div>
            <Typography.Title level={4}>Agenda do dia</Typography.Title>
            <Typography.Text type="secondary">{formatDateKeyLong(selectedDateKey)}</Typography.Text>
          </div>
          <span className="calendar-day-count">{selectedItems.length}</span>
        </div>

        {loading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : selectedItems.length === 0 ? (
          <Empty description="Nenhum vencimento nesse dia" />
        ) : (
          <div className="calendar-agenda-list">
            {selectedItems.map((item) => (
              <ObrigacaoAgendaCard
                key={item.id}
                obrigacao={item}
                onRegistrarEntrega={onRegistrarEntrega}
              />
            ))}
          </div>
        )}
      </aside>
    </section>
  );
}

function buildDayClass(items: ObrigacaoDto[], selected: boolean, inMonth: boolean) {
  const tone = getDominantTone(items);
  return [
    "calendar-day",
    !inMonth ? "is-outside" : "",
    selected ? "is-selected" : "",
    items.length ? "has-items" : "",
    tone ? `tone-${tone}` : ""
  ]
    .filter(Boolean)
    .join(" ");
}

function getDominantTone(items: ObrigacaoDto[]) {
  const tones = items.map(urgencyTone);

  if (tones.includes("overdue")) return "overdue";
  if (tones.includes("today")) return "today";
  if (tones.includes("soon")) return "soon";
  if (tones.includes("done")) return "done";
  return tones.length ? "future" : null;
}
