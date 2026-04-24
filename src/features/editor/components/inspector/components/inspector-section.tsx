type InspectorSectionProps = {
    title: string;
    children: React.ReactNode;
};

const InspectorSection: React.FC<InspectorSectionProps> = ({
    title,
    children,
}: InspectorSectionProps) => {
    return (
        <section className='border-b border-black/10 px-4 py-4 last:border-b-0'>
            <h2 className='mb-3 text-xs font-medium uppercase tracking-[0.08em] text-neutral-500'>
                {title}
            </h2>
            <div className='space-y-3'>{children}</div>
        </section>
    );
};

export default InspectorSection;
