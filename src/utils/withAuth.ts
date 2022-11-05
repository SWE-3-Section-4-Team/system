import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult, PreviewData } from 'next';
import { getSession } from 'next-auth/react';
import { type ParsedUrlQuery } from 'querystring';
import type { User } from '../types/user';

type Handler<
    P extends { [key: string]: any } = { [key: string]: any },
    Q extends ParsedUrlQuery = ParsedUrlQuery,
    D extends PreviewData = PreviewData
> = (context: GetServerSidePropsContext<Q, D>, user: User) => Promise<GetServerSidePropsResult<P>>

const isHandler = <
    P extends { [key: string]: any } = { [key: string]: any },
    Q extends ParsedUrlQuery = ParsedUrlQuery,
    D extends PreviewData = PreviewData
>(handlerOrProps: Handler<P, Q, D> | P): handlerOrProps is Handler<P> => {
        return typeof handlerOrProps === 'function';
    };

export const withAuth = <
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
>(handlerOrProps: Handler<P, Q, D> | P, redirect = '/auth'): GetServerSideProps<P, Q, D> => async (ctx) => {
    const session = await getSession(ctx);

    if (session) {
        const { user } = session;

        if (user) {
            if (isHandler(handlerOrProps)) {
                console.log('here is user', user);
                return await handlerOrProps(ctx, user);
            }
    
            return {
                props: handlerOrProps as P,
            };
        }
    }

    return {
        redirect: {
            destination: redirect,
            permanent: false,
        },
    };
};
