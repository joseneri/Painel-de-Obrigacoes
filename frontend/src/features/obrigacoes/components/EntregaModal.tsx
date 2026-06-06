import { useEffect } from "react";
import { DatePicker, Form, Input, Modal, Typography } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import type { ObrigacaoDto } from "../../../api/types";
import { labelTipo } from "../../../shared/utils/domain";

export interface EntregaFormValues {
  dataConclusao: Dayjs;
  observacao?: string;
}

interface EntregaModalProps {
  open: boolean;
  obrigacao: ObrigacaoDto | null;
  confirmLoading: boolean;
  onCancel: () => void;
  onSubmit: (values: EntregaFormValues) => void;
}

export function EntregaModal({
  open,
  obrigacao,
  confirmLoading,
  onCancel,
  onSubmit
}: EntregaModalProps) {
  const [form] = Form.useForm<EntregaFormValues>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ dataConclusao: dayjs(), observacao: "" });
    }
  }, [form, open]);

  return (
    <Modal
      open={open}
      title="Registrar entrega"
      okText="Registrar"
      cancelText="Cancelar"
      confirmLoading={confirmLoading}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
    >
      {obrigacao && (
        <Typography.Paragraph type="secondary">
          {labelTipo(obrigacao.tipo)} · {obrigacao.empresaRazaoSocial}
        </Typography.Paragraph>
      )}

      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="dataConclusao"
          label="Data de conclusão"
          rules={[{ required: true, message: "Informe a data de conclusão." }]}
        >
          <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="observacao" label="Observação">
          <Input.TextArea rows={3} maxLength={240} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
}
