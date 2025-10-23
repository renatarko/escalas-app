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

type InviteEmailTemplateProps = {
  email?: string;
  bandName: string;
  inviteId: string;
};

export const InviteEmailTemplate = ({
  email,
  bandName,
  inviteId,
}: InviteEmailTemplateProps) => {
  const baseUrl = process.env.NEXT_AUTH_URL;
  const inviteUrl = `${baseUrl}/invite/${inviteId}`;

  const previewText = `Convite para ser membro de uma banda`;

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
              <Heading style={{ ...h1 }}>
                Você foi convidado para ser membro da banda {bandName} 🎶
              </Heading>
              <Section
                style={{
                  ...mainText,
                  textAlign: "center",
                  background: "#F6F6F6",
                }}
              >
                {/* <Text>Você recebeu um convite para o email:</Text>
                <Text style={nameText}>{maskEmail(email)}</Text> */}
                <Text>Para aceitar o convite, clique no botão abaixo:</Text>

                <Button href={inviteUrl} style={buttonLink}>
                  Aceitar convite
                </Button>
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
  backgroundColor: "#0004",
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
  padding: "8px",
  color: "#FFF",
  background: "#0004",
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
