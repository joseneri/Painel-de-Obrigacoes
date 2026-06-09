import { Button, Empty, Skeleton, Tag, Tooltip, Typography } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import type { ObrigacaoDto } from "../../../api/types";
import {
  labelStatus,
  labelTipo,
  normalizeStatus,
  statusColor,
  StatusObrigacao
} from "../../../shared/utils/domain";
import { formatCompetencia, formatDate, urgencyText } from "../../../shared/utils/formatters";
import type { AgendaGroup } from "./calendarioModel";

interface ObrigacoesAgendaProps {
  groups: AgendaGroup[];
  loading: boolean;
  onRegistrarEntrega: (obrigacao: ObrigacaoDto) => void;
  onClearFilters: () => void;
}

export function ObrigacoesAgenda({
  groups,
  loading,
  onRegistrarEntrega,
  onClearFilters
}: ObrigacoesAgendaProps) {
  if (loading && !groups.length) {
    return (
      <section className="panel calendario-agenda">
        <Skeleton active paragraph={{ rows: 6 }} />
      </section>
    );
  }

  return (
    <section className="panel calendario-agenda">
      <div className="calendario-section-header">
        <div>
          <Typography.Title level={4}>Agenda do mes</Typography.Title>
          <Typography.Text type="secondary">{countItems(groups)} prazos encontrados</Typography.Text>
        </div>
      </div>

      {!groups.length ? (
        <Empty description="Nenhuma obrigacao encontrada">
          <Button onClick={onClearFilters}>Limpar filtros</Button>
        </Empty>
      ) : (
        <div className="agenda-groups">
          {groups.map((group) => (
            <article className="agenda-group" key={group.dateKey}>
              <div className="agenda-group__date">
                <strong>{formatDate(group.dateKey)}</strong>
                <span>{group.rows.length} item(ns)</span>
              </div>

              <div className="agenda-group__items">
                {group.rows.slice(0, 4).map((row) => (
                  <AgendaItem key={row.id} row={row} onRegistrarEntrega={onRegistrarEntrega} />
                ))}
                {group.rows.length > 4 && (
                  <div className="agenda-item agenda-item--more">
                    +{group.rows.length - 4} registros no detalhamento
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

interface AgendaItemProps {
  row: ObrigacaoDto;
  onRegistrarEntrega: (obrigacao: ObrigacaoDto) => void;
}

function AgendaItem({ row, onRegistrarEntrega }: AgendaItemProps) {
  const status = normalizeStatus(row.status);
  const disabled = status === StatusObrigacao.Entregue || status === StatusObrigacao.NaoAplicavel;
  const tooltip = disabled ? "Entrega ja registrada" : "Marcar como entregue";

  return (
    <div className="agenda-item" data-status={status}>
      <div className="agenda-item__main">
        <Typography.Text strong>{labelTipo(row.tipo)}</Typography.Text>
        <Typography.Text type="secondary" ellipsis title={row.empresaRazaoSocial}>
          {row.empresaRazaoSocial}
        </Typography.Text>
      </div>

      <div className="agenda-item__meta">
        <Tag>{formatCompetencia(row.competencia, row.ano, row.mes)}</Tag>
        <Tag color={statusColor(row.status)}>{labelStatus(row.status)}</Tag>
        <Tag color={row.diasParaVencer < 0 ? "error" : "processing"}>
          {urgencyText(row.diasParaVencer)}
        </Tag>
      </div>

      <Tooltip title={tooltip}>
        <Button
          className="agenda-item__action"
          type="primary"
          ghost
          icon={<CheckOutlined />}
          disabled={disabled}
          onClick={() => onRegistrarEntrega(row)}
        >
          Entregar
        </Button>
      </Tooltip>
    </div>
  );
}

function countItems(groups: AgendaGroup[]) {
  return groups.reduce((total, group) => total + group.rows.length, 0);
}
