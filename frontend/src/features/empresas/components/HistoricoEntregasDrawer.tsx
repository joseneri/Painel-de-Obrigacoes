import { Alert, Drawer, Empty, Skeleton, Tag, Timeline, Typography } from "antd";
import { CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import type { EmpresaDto, EntregaHistoricoDto } from "../../../api/types";
import { useHistoricoEntregasEmpresa } from "../../../api/hooks";
import { labelStatus, labelTipo, statusColor } from "../../../shared/utils/domain";
import { getErrorMessage } from "../../../shared/utils/errors";
import { formatDate } from "../../../shared/utils/formatters";

interface HistoricoEntregasDrawerProps {
  empresa?: EmpresaDto;
  open: boolean;
  onClose: () => void;
}

export function HistoricoEntregasDrawer({ empresa, open, onClose }: HistoricoEntregasDrawerProps) {
  const historicoQuery = useHistoricoEntregasEmpresa(open ? empresa?.id : undefined);
  const historico = historicoQuery.data ?? [];

  return (
    <Drawer
      size="large"
      title="Historico de entregas"
      open={open}
      onClose={onClose}
      destroyOnHidden
      styles={{ body: { background: "#f8fafc", padding: 20 } }}
    >
      <div className="grid gap-4">
        <div className="rounded-lg border border-[#e5edf5] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <Typography.Text className="block !text-xs !font-extrabold uppercase !tracking-normal !text-[#64748b]">
            Empresa
          </Typography.Text>
          <Typography.Title className="!mb-0 !mt-1 !text-[20px] !font-extrabold !text-[#0f172a]" level={4}>
            {empresa?.razaoSocial ?? "-"}
          </Typography.Title>
        </div>

        {historicoQuery.isError && (
          <Alert
            type="error"
            showIcon
            message="Nao foi possivel carregar o historico"
            description={getErrorMessage(historicoQuery.error)}
          />
        )}

        {historicoQuery.isLoading || historicoQuery.isFetching ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : historico.length === 0 ? (
          <Empty description="Nenhuma entrega registrada para esta empresa" />
        ) : (
          <Timeline
            items={historico.map((item) => ({
              color: "green",
              dot: <CheckCircleOutlined />,
              children: <HistoricoItem item={item} />
            }))}
          />
        )}
      </div>
    </Drawer>
  );
}

function HistoricoItem({ item }: { item: EntregaHistoricoDto }) {
  return (
    <div className="rounded-lg border border-[#e5edf5] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Typography.Text className="!text-[15px] !font-extrabold !text-[#0f172a]">
            {labelTipo(item.tipo)}
          </Typography.Text>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-[#64748b]">
            <span>{item.competencia}</span>
            <span className="text-[#cbd5e1]">|</span>
            <span className="inline-flex items-center gap-1">
              <CalendarOutlined />
              Vence {formatDate(item.dataVencimento)}
            </span>
          </div>
        </div>
        <Tag color={statusColor(item.status)}>{labelStatus(item.status)}</Tag>
      </div>

      <div className="mt-3 rounded-md bg-[#f8fafc] px-3 py-2 text-sm font-semibold text-[#334155]">
        Concluida em {formatDate(item.dataConclusao)}
      </div>

      {item.observacao && (
        <Typography.Paragraph className="!mb-0 !mt-3 !text-sm !text-[#475569]">
          {item.observacao}
        </Typography.Paragraph>
      )}
    </div>
  );
}
