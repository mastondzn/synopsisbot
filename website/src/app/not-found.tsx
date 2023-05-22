import { PageBase } from '~/components/page-base';

export default function Page() {
    return (
        <PageBase className="gap-16">
            <div className="flex flex-col gap-3 items-center justify-center">
                <p className="text-8xl font-extrabold row-span-2 col-span-2 justify-self-end">
                    404
                </p>
                <p className="text-2xl font-bold col-span-3">{'This page does not exist.'}</p>
            </div>
        </PageBase>
    );
}
