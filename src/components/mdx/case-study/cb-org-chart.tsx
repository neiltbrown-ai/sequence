interface OrgChild {
  name: string;
  desc: string;
}

interface CbOrgChartProps {
  title?: string;
  parent: string;
  items?: OrgChild[];
  itemsJson?: string;
}

export function CbOrgChart({ title, parent, items, itemsJson }: CbOrgChartProps) {
  const kids: OrgChild[] = items || (itemsJson ? JSON.parse(itemsJson) : []);

  return (
    <div className="cb-grid is-org">
      <div className="cs-org">
        {title && <div className="cs-org-title">{title}</div>}
        <div className="cs-org-parent">
          <div className="cs-org-parent-name">{parent}</div>
        </div>
        <div className="cs-org-children">
          {kids.map((c) => (
            <div key={c.name} className="cs-org-child">
              <div className="cs-org-child-name">{c.name}</div>
              <div className="cs-org-child-desc">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
