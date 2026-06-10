import { useMemo, useState } from "react";
import { App as AntApp, Alert, Button, Form, Input, Select } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useCreateEmpresa, useEmpresas } from "../../api/hooks";
import type { EmpresaDto } from "../../api/types";
import { PageHeader } from "../../shared/ui/PageHeader";
import {
  filterFieldClassName,
  filterInputClassName,
  filterLabelClassName,
  filterSelectClassName,
  pageCardClassName,
  pageShellClassName
} from "../../shared/ui/styles";
import { getErrorMessage } from "../../shared/utils/errors";
import { formatCnpj, onlyDigits } from "../../shared/utils/formatters";
import { normalizeRegime, regimeOptions } from "../../shared/utils/domain";
import { EmpresasTable } from "./components/EmpresasTable";
import { HistoricoEntregasDrawer } from "./components/HistoricoEntregasDrawer";

interface EmpresaFormValues {
  razaoSocial: string;
  cnpj: string;
  regimeTributario: number;
}

const formGridClassName =
  "grid min-w-0 grid-cols-[minmax(220px,1.4fr)_minmax(180px,0.9fr)_minmax(180px,0.9fr)_auto] items-end gap-3 max-[1100px]:grid-cols-2 max-[720px]:grid-cols-1 [&_.ant-form-item-label>label]:!h-[18px] [&_.ant-form-item-label>label]:!text-xs [&_.ant-form-item-label>label]:!font-extrabold [&_.ant-form-item-label>label]:!tracking-normal [&_.ant-form-item-label>label]:!text-[#1f2937]";

export function EmpresasPage() {
  const { message } = AntApp.useApp();
  const [form] = Form.useForm<EmpresaFormValues>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegime, setSelectedRegime] = useState<number>();
  const [empresaHistorico, setEmpresaHistorico] = useState<EmpresaDto>();
  const { data: empresas = [], isLoading, isError, error, isFetching } = useEmpresas();
  const createEmpresa = useCreateEmpresa();

  const filteredEmpresas = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR");

    return empresas.filter((empresa) => {
      const matchesSearch =
        !normalizedSearch || empresa.razaoSocial.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
      const matchesRegime = !selectedRegime || normalizeRegime(empresa.regimeTributario) === selectedRegime;

      return matchesSearch && matchesRegime;
    });
  }, [empresas, searchTerm, selectedRegime]);

  function handleSubmit(values: EmpresaFormValues) {
    createEmpresa.mutate(
      {
        razaoSocial: values.razaoSocial.trim(),
        cnpj: onlyDigits(values.cnpj),
        regimeTributario: values.regimeTributario
      },
      {
        onSuccess: () => {
          message.success("Empresa cadastrada.");
          form.resetFields();
        },
        onError: (error) => message.error(getErrorMessage(error))
      }
    );
  }

  return (
    <div className={pageShellClassName}>
      {isError && error && (
        <Alert
          type="error"
          showIcon
          title="Não foi possível carregar as empresas"
          description={getErrorMessage(error)}
        />
      )}

      <section className={pageCardClassName}>
        <PageHeader title="Empresas" subtitle="Cadastre CNPJs e mantenha a geração de obrigações por regime." />

        <div className="border-b border-[#edf1f5] bg-[#f8fafc] px-7 pb-6 pt-5 max-[720px]:p-4">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div className={formGridClassName}>
              <Form.Item
                className="!mb-0 min-w-0"
                name="razaoSocial"
                label="Razão social"
                rules={[{ required: true, message: "Informe a razão social." }]}
              >
                <Input className={filterInputClassName} placeholder="Ex.: Contabilidade Alfa Ltda" />
              </Form.Item>

              <Form.Item
                className="!mb-0 min-w-0"
                name="cnpj"
                label="CNPJ"
                normalize={(value) => formatCnpj(value ?? "")}
                rules={[
                  { required: true, message: "Informe o CNPJ." },
                  { validator: validateCnpjLength }
                ]}
              >
                <Input className={filterInputClassName} placeholder="00.000.000/0000-00" maxLength={18} />
              </Form.Item>

              <Form.Item
                className="!mb-0 min-w-0"
                name="regimeTributario"
                label="Regime tributário"
                rules={[{ required: true, message: "Selecione o regime." }]}
              >
                <Select className={filterSelectClassName} placeholder="Selecione" options={regimeOptions} />
              </Form.Item>

              <Form.Item className="!mb-0 min-w-0" label=" ">
                <Button
                  className="!h-12 !min-h-12 rounded-lg font-bold"
                  type="primary"
                  htmlType="submit"
                  icon={<PlusOutlined />}
                  loading={createEmpresa.isPending}
                  block
                >
                  Cadastrar
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
      </section>

      <EmpresasTable
        data={filteredEmpresas}
        loading={isLoading || isFetching}
        onOpenHistorico={setEmpresaHistorico}
        toolbar={
          <div className="grid min-w-0 w-[min(760px,100%)] grid-cols-[minmax(360px,1fr)_minmax(180px,220px)] items-end gap-3 max-[1180px]:w-full max-[720px]:grid-cols-1">
            <Input
              allowClear
              aria-label="Buscar empresa por razão social"
              className={filterInputClassName}
              prefix={<SearchOutlined />}
              placeholder="Buscar por razão social"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <div className={filterFieldClassName}>
              <span className={filterLabelClassName}>Regime tributário</span>
              <Select<number>
                allowClear
                aria-label="Filtrar empresas por regime"
                className={filterSelectClassName}
                placeholder="Todos os regimes"
                value={selectedRegime}
                onChange={setSelectedRegime}
                optionFilterProp="label"
                options={regimeOptions}
              />
            </div>
          </div>
        }
      />

      <HistoricoEntregasDrawer
        empresa={empresaHistorico}
        open={Boolean(empresaHistorico)}
        onClose={() => setEmpresaHistorico(undefined)}
      />
    </div>
  );
}

function validateCnpjLength(_: unknown, value?: string) {
  return onlyDigits(value ?? "").length === 14
    ? Promise.resolve()
    : Promise.reject(new Error("CNPJ deve conter 14 dígitos."));
}
