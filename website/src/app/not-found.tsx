import { PageBase } from '~/components/page-base';

export default function Page() {
    return (
        <PageBase className="gap-16">
            <div className="flex flex-col items-center justify-center gap-3">
                <p className="col-span-2 row-span-2 justify-self-end text-8xl font-extrabold">
                    404
                </p>
                <p className="col-span-3 text-2xl font-bold">{'This page does not exist.'}</p>
            </div>
        </PageBase>
    );
}
