import { App as AntApp, Alert, Button, Form, Input, Select, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useCreateEmpresa, useEmpresas } from "../../api/hooks";
import { getErrorMessage } from "../../shared/utils/errors";
import { formatCnpj, onlyDigits } from "../../shared/utils/formatters";
import { regimeOptions } from "../../shared/utils/domain";
import { EmpresasTable } from "./components/EmpresasTable";

interface EmpresaFormValues {
  razaoSocial: string;
  cnpj: string;
  regimeTributario: number;
}

export function EmpresasPage() {
  const { message } = AntApp.useApp();
  const [form] = Form.useForm<EmpresaFormValues>();
  const empresas = useEmpresas();
  const createEmpresa = useCreateEmpresa();

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
      {empresas.error && (
        <Alert
          type="error"
          showIcon
          title="Não foi possível carregar as empresas"
          description={getErrorMessage(empresas.error)}
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

      <EmpresasTable data={empresas.data ?? []} loading={empresas.isLoading || empresas.isFetching} />
    </div>
  );
}
