import { Button, Tag, Tooltip, Typography } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import type { ObrigacaoDto } from "../../../api/types";
import {
  labelPeriodicidade,
  labelStatus,
  labelTipo,
  normalizeStatus,
  statusColor,
  StatusObrigacao
} from "../../../shared/utils/domain";
import { formatCompetencia, formatDate, urgencyText } from "../../../shared/utils/formatters";
import { isAnual, toneClass, urgencyLabel } from "../calendarioPresentation";

interface ObrigacaoAgendaCardProps {
  obrigacao: ObrigacaoDto;
  onRegistrarEntrega: (obrigacao: ObrigacaoDto) => void;
}

export function ObrigacaoAgendaCard({ obrigacao, onRegistrarEntrega }: ObrigacaoAgendaCardProps) {
  const status = normalizeStatus(obrigacao.status);
  const disabled = status === StatusObrigacao.Entregue || status === StatusObrigacao.NaoAplicavel;

  return (
    <article className={`obrigacao-agenda-card ${toneClass(obrigacao)}`}>
      <div className="obrigacao-card-main">
        <div className="obrigacao-card-title-row">
          <Typography.Text strong>{labelTipo(obrigacao.tipo)}</Typography.Text>
          <Tag className={`urgency-chip ${toneClass(obrigacao)}`}>{urgencyLabel(obrigacao)}</Tag>
        </div>

        <Typography.Text className="obrigacao-card-company">
          {obrigacao.empresaRazaoSocial}
        </Typography.Text>

        <div className="obrigacao-card-meta">
          <span>Venc. {formatDate(obrigacao.dataVencimento)}</span>
          <span>Comp. {formatCompetencia(obrigacao.competencia, obrigacao.ano, obrigacao.mes)}</span>
          <span>{urgencyText(obrigacao.diasParaVencer)}</span>
        </div>

        <div className="obrigacao-card-tags">
          <Tag color={statusColor(obrigacao.status)}>{labelStatus(obrigacao.status)}</Tag>
          <Tag>{labelPeriodicidade(obrigacao.periodicidade)}</Tag>
          {isAnual(obrigacao) && <Tag color="cyan">Anual</Tag>}
        </div>
      </div>

      <Tooltip title={disabled ? "Entrega ja registrada" : "Marcar como entregue"}>
        <Button
          aria-label={`Marcar ${labelTipo(obrigacao.tipo)} como entregue`}
          className="obrigacao-card-action"
          type="primary"
          ghost
          icon={<CheckOutlined />}
          disabled={disabled}
          onClick={() => onRegistrarEntrega(obrigacao)}
        />
      </Tooltip>
    </article>
  );
}
