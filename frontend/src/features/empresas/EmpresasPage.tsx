import { useMemo, useState } from "react";
import { App as AntApp, Alert, Button, Form, Input, Select, Typography } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useCreateEmpresa, useEmpresas } from "../../api/hooks";
import { getErrorMessage } from "../../shared/utils/errors";
import { formatCnpj, onlyDigits } from "../../shared/utils/formatters";
import { normalizeRegime, regimeOptions } from "../../shared/utils/domain";
import { EmpresasTable } from "./components/EmpresasTable";
import "./empresas.css";

interface EmpresaFormValues {
  razaoSocial: string;
  cnpj: string;
  regimeTributario: number;
}

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
    <div className="page-stack">
      {isError && error && (
        <Alert
          type="error"
          showIcon
          title="Não foi possível carregar as empresas"
          description={getErrorMessage(error)}
        />
      )}

      <section className="panel">
        <div className="panel-header">
          <div>
            <Typography.Title level={3}>Cadastrar empresa</Typography.Title>
            <Typography.Text type="secondary">
              A API gera automaticamente as obrigações futuras conforme o regime.
            </Typography.Text>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="form-grid">
            <Form.Item
              name="razaoSocial"
              label="Razão social"
              rules={[{ required: true, message: "Informe a razão social." }]}
            >
              <Input placeholder="Ex.: Contabilidade Alfa Ltda" />
            </Form.Item>

            <Form.Item
              name="cnpj"
              label="CNPJ"
              normalize={(value) => formatCnpj(value ?? "")}
              rules={[{ required: true, message: "Informe o CNPJ." }]}
            >
              <Input placeholder="00.000.000/0000-00" maxLength={18} />
            </Form.Item>

            <Form.Item
              name="regimeTributario"
              label="Regime tributário"
              rules={[{ required: true, message: "Selecione o regime." }]}
            >
              <Select placeholder="Selecione" options={regimeOptions} />
            </Form.Item>

            <Form.Item label=" ">
              <Button
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
      </section>

      <EmpresasTable
        data={filteredEmpresas}
        loading={isLoading || isFetching}
        summary={summary}
        toolbar={
          <div className="empresas-filters">
            <Input
              allowClear
              aria-label="Buscar empresa por razão social"
              prefix={<SearchOutlined />}
              placeholder="Buscar por razão social"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <Select<number>
              allowClear
              aria-label="Filtrar empresas por regime"
              placeholder="Todos os regimes"
              value={selectedRegime}
              onChange={setSelectedRegime}
              optionFilterProp="label"
              options={regimeOptions}
            />
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
