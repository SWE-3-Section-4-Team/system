import { useFormik } from "formik"
import { type NextPage } from "next"
import { signIn } from "next-auth/react"
import { useRouter } from "next/router"
import React from "react"
import { Button } from "../../components/Button"
import { Container } from "../../components/Container"
import { Divider } from "../../components/Divider"
import { Input } from "../../components/Input"
import { Page } from "../../components/Page"
import { Stack } from "../../components/Stack"
import { Text, Title } from "../../components/Typography"
import { type CredentialsSchema, credentialsSchema } from "../../schema/credentials"
import { zodToFormik } from "../../utils/zodToFormik"

const AuthPage: NextPage = () => {
    const { query } = useRouter();
    const { getFieldProps, touched, errors, handleSubmit } = useFormik<CredentialsSchema>({
        initialValues: {
            pin: '',
            password: '',
        },
        onSubmit: (values) => {
            signIn('credentials', {
                username: values.pin,
                password: values.password,
                callbackUrl: '/admin',
            });
        },
        validateOnBlur: true,
        validationSchema: zodToFormik(credentialsSchema),
    });

    const getError = React.useCallback((name: keyof CredentialsSchema) => {
        return touched[name] && errors[name] ? errors[name] : undefined;
    }, [touched, errors]);


    return (
        <Page>
            <Container size="xs">
                <Title level={1}>Sign in</Title>
                {query.error && (
                    <>
                        <Text font={14} type="error">
                            {query.error}
                        </Text>
                        <Divider />
                    </>
                )}
                <form onSubmit={handleSubmit}>
                    <Stack direction="column" gap={12}>
                        <Input
                            label="PIN"
                            error={getError('pin')}
                            {...getFieldProps('pin')}
                        />
                        <Input
                            label="Password"
                            type="password"
                            error={getError('password')}
                            {...getFieldProps('password')}
                        />
                        <Button variant="primary" size='large' type="submit">Login</Button>
                    </Stack>
                </form>
            </Container>
        </Page>
    )
}

export default AuthPage;
