import { useRouter } from "next/router";
import React from "react";

const Home = () => {
    const { push } = useRouter();

    React.useEffect(() => {
        push('/auth');
    }, [push]);

    return (
        <div>
            ...
        </div>
    )
}

export default Home;