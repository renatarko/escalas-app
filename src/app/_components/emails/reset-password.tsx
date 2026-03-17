import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type ResetPasswordEmailTemplateProps = {
  email: string;
  resetUrl: string;
};

export const ResetPasswordEmailTemplate = ({
  email,
  resetUrl,
}: ResetPasswordEmailTemplateProps) => {
  const previewText = `Redefinição de senha - Escalas App`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={coverSection}>
            <Section style={{ ...imageSection, textAlign: "center" }}>
              <Heading style={{ ...title, textAlign: "center" }}>
                Escalas App
              </Heading>
            </Section>
            <Section style={upperSection}>
              <Heading style={h1}>Redefinição de senha</Heading>
              <Section
                style={{
                  ...mainText,
                  textAlign: "center",
                  background: "#F6F6F6",
                }}
              >
                <Text>Recebemos uma solicitação para redefinir a senha da conta:</Text>
                <Text>{email}</Text>
                <Text>Clique no botão abaixo para criar uma nova senha. O link expira em 1 hora.</Text>

                <Button href={resetUrl} style={buttonLink}>
                  Redefinir senha
                </Button>

                <Text style={{ fontSize: "12px", color: "#888" }}>
                  Se você não solicitou a redefinição de senha, ignore este email.
                </Text>
              </Section>
            </Section>
            <Hr />
          </Section>
          <Text style={footerText}>
            Esta mensagem foi produzida e distribuída por Escalas App.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const body = {
  backgroundColor: "#fff",
  color: "#212121",
};

const container = {
  padding: "20px",
  margin: "0 auto",
  backgroundColor: "#eee",
};

const title = {
  color: "#ffffff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "20px",
  fontWeight: "bold",
};

const h1 = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: "15px",
};

const text = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
};

const imageSection = {
  backgroundColor: "#104e64",
  padding: "20px 0",
};

const coverSection = { backgroundColor: "#fff" };

const upperSection = { padding: "35px 35px" };

const footerText = {
  ...text,
  fontSize: "12px",
  padding: "0 20px",
};

const buttonLink = {
  ...text,
  padding: "8px 16px",
  color: "#FFF",
  background: "#104e64",
  borderRadius: "8px",
  fontWeight: "bold",
};

const mainText = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "18px",
  paddingBottom: "20px",
};
