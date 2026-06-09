import { useMemo, useState } from "react";
import { App as AntApp, Alert, Button, Form, Input, Select, Typography } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useCreateEmpresa, useEmpresas } from "../../api/hooks";
import { getErrorMessage } from "../../shared/utils/errors";
import { formatCnpj, onlyDigits } from "../../shared/utils/formatters";
import { normalizeRegime, regimeOptions } from "../../shared/utils/domain";
import { EmpresasTable } from "./components/EmpresasTable";

interface EmpresaFormValues {
  razaoSocial: string;
  cnpj: string;
  regimeTributario: number;
}

const formGridClassName =
  "grid min-w-0 grid-cols-[minmax(220px,1.4fr)_minmax(180px,0.9fr)_minmax(180px,0.9fr)_auto] items-end gap-3 max-[1100px]:grid-cols-2 max-[720px]:grid-cols-1 [&_.ant-form-item-label>label]:!h-[18px] [&_.ant-form-item-label>label]:!text-xs [&_.ant-form-item-label>label]:!font-extrabold [&_.ant-form-item-label>label]:!tracking-normal [&_.ant-form-item-label>label]:!text-[#1f2937]";
const inputClassName =
  "h-12 min-w-0 rounded-lg border-[#aebdcc] bg-[#f8fafc] font-semibold text-[#0f172a] shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] placeholder:font-semibold placeholder:text-[#64748b] [&_.ant-input-prefix]:text-[#475569]";
const selectClassName =
  "h-12 min-w-0 w-full [&_.ant-select-selector]:!h-12 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#aebdcc] [&_.ant-select-selector]:!bg-[#f8fafc] [&_.ant-select-selector]:!shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] [&_.ant-select-selection-placeholder]:!font-semibold [&_.ant-select-selection-placeholder]:!leading-[46px] [&_.ant-select-selection-placeholder]:!text-[#64748b] [&_.ant-select-selection-item]:!font-semibold [&_.ant-select-selection-item]:!leading-[46px] [&_.ant-select-selection-item]:!text-[#0f172a] [&_.ant-select-arrow]:!text-[#475569] [&_.ant-select-suffix]:!text-[#475569]";
const filterFieldClassName = "grid min-w-0 grid-rows-[18px_48px] items-start gap-[9px]";
const filterLabelClassName = "text-xs font-extrabold leading-[18px] tracking-normal text-[#111827]";
const filterSelectClassName =
  "!h-12 !min-h-12 w-full !rounded-lg !border-[#e5e7eb] !bg-white !shadow-none [&_.ant-select-content]:!flex [&_.ant-select-content]:!h-12 [&_.ant-select-content]:!min-h-12 [&_.ant-select-content]:!items-center [&_.ant-select-content]:!rounded-lg [&_.ant-select-content]:!border [&_.ant-select-content]:!border-[#e5e7eb] [&_.ant-select-content]:!bg-white [&_.ant-select-content]:!px-3 [&_.ant-select-selector]:!h-12 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#e5e7eb] [&_.ant-select-selector]:!bg-white [&_.ant-select-placeholder]:!font-semibold [&_.ant-select-placeholder]:!text-[#667085] [&_.ant-select-selection-item]:!font-semibold [&_.ant-select-selection-item]:!text-[#0f172a] [&_.ant-select-suffix]:!text-[#98a2b3]";

export function EmpresasPage() {
  const { message } = AntApp.useApp();
  const [form] = Form.useForm<EmpresaFormValues>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegime, setSelectedRegime] = useState<number>();
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

  const summary = getEmpresasSummary(filteredEmpresas.length, empresas.length);

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
    <div className="box-border grid min-w-0 max-w-full gap-5 max-[720px]:pr-3">
      {isError && error && (
        <Alert
          type="error"
          showIcon
          title="Não foi possível carregar as empresas"
          description={getErrorMessage(error)}
        />
      )}

      <section className="min-w-0 max-w-full overflow-hidden rounded-lg border border-[#dbe5ef] bg-white max-[720px]:w-[calc(100%-24px)]">
        <div className="relative flex items-start justify-between gap-5 border-b border-[#edf1f5] bg-white px-8 pb-6 pt-7 before:absolute before:inset-y-0 before:left-0 before:w-[5px] before:bg-[#1677ff] before:content-[''] max-[720px]:px-4">
          <div>
            <Typography.Title
              className="!mb-2 !mt-0 !text-[30px] !font-extrabold !leading-[1.12] !tracking-normal !text-[#0f172a] max-[720px]:!text-[25px]"
              level={2}
            >
              Empresas
            </Typography.Title>
            <Typography.Text className="!text-[15px] !text-[#526173]" type="secondary">
              Cadastre CNPJs e mantenha a geração de obrigações por regime.
            </Typography.Text>
          </div>
        </div>

        <div className="border-b border-[#edf1f5] bg-[#f8fafc] px-7 pb-6 pt-5 max-[720px]:p-4">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div className={formGridClassName}>
              <Form.Item
                className="!mb-0 min-w-0"
                name="razaoSocial"
                label="Razão social"
                rules={[{ required: true, message: "Informe a razão social." }]}
              >
                <Input className={inputClassName} placeholder="Ex.: Contabilidade Alfa Ltda" />
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
                <Input className={inputClassName} placeholder="00.000.000/0000-00" maxLength={18} />
              </Form.Item>

              <Form.Item
                className="!mb-0 min-w-0"
                name="regimeTributario"
                label="Regime tributário"
                rules={[{ required: true, message: "Selecione o regime." }]}
              >
                <Select className={selectClassName} placeholder="Selecione" options={regimeOptions} />
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
        summary={summary}
        toolbar={
          <div className="grid min-w-0 w-[min(560px,100%)] grid-cols-[minmax(220px,320px)_minmax(180px,220px)] items-end gap-3 max-[720px]:w-full max-[720px]:grid-cols-1">
            <Input
              allowClear
              aria-label="Buscar empresa por razão social"
              className={inputClassName}
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
    </div>
  );
}

function getEmpresasSummary(filteredCount: number, totalCount: number) {
  if (filteredCount === totalCount) {
    return `${totalCount} ${totalCount === 1 ? "empresa cadastrada" : "empresas cadastradas"}`;
  }

  return `${filteredCount} de ${totalCount} empresas`;
}

function validateCnpjLength(_: unknown, value?: string) {
  return onlyDigits(value ?? "").length === 14
    ? Promise.resolve()
    : Promise.reject(new Error("CNPJ deve conter 14 dígitos."));
}
