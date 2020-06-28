import * as React from 'react'
import { OnHover } from '@libs/OnHover.tsx'
import { RightOutlined, DownOutlined } from '@ant-design/icons'
import { useHistory, useLocation } from 'react-router-dom'

const styles: Record<
  'stickyColWrapper' | 'stickyColWithoutScrollbar'
  , React.CSSProperties> = {
    stickyColWrapper: {
        position: "sticky",
        top: 0,
        height: "100%",
        minWidth: "355px",
        overflow: "hidden",
    },
    stickyColWithoutScrollbar: {
        width: "100%",
        height: "100%",
        maxHeight: "100vh",
        boxSizing: "content-box", // use `content-box` to exclude the right padding of child's width
        paddingRight: "20px", // the right padding 20px is used to hide the scrollbar
        overflow: "hidden auto",
    }
};

const getParentPath = (pages: Pages, targetUid: string): string | undefined => {
    for (let i = 0; i < pages?.length; i++) {
        const page = pages[i]
        if (page.uid === targetUid) {
            return page.parentPath
        }

        if (!!page?.pages?.length) {
            const parentPath = getParentPath(page.pages, targetUid)

            if (parentPath) {
                return parentPath
            }
        }
    }
}

const getPathList = (versionName: string, pageName: string, container: string[], targetPath?: string) => {
    const pageRoutes = reversion.versions[versionName]?.page;
    const parentPath = getParentPath(pageRoutes?.pages, targetPath || pageName)
    if (parentPath) {
        container.push(parentPath)
        getPathList(versionName, pageName, container, parentPath)
    }
}

const getPageInfo = (versionName: string, uid: string, page: VersionInfo) => {
    const pathList: string[] = [uid]
    getPathList(versionName, uid, pathList)
    const onSelect = pathList[0] === page?.uid
    const hasChildren = !!page?.pages?.length
    const onOpen = pathList.includes(page?.uid) && hasChildren

    return {
        onSelect,
        onOpen,
        hasChildren,
    }
}

const formatPageRoutes = (versionName: string, pageName: string, p: VersionInfo, parentUid?: string) => {
    const { hasChildren } = getPageInfo(versionName, pageName, p)

    if (hasChildren) {
        (p?.pages || []).forEach(page => formatPageRoutes(versionName, pageName, page, p.uid))
    }

    if (!!parentUid) {
        p['parentPath'] = parentUid
    }
}

export const getVersionPage = (pathName?: string): {
    version: string;
    uid: string;
} | undefined => {
    const path = pathName || location.pathname || ""
    const args = path?.split("/").slice(-2)
    if (args?.length === 2) {
        const [version, uid] = args
        return {
            version, uid
        }
    }
    return undefined
}

export const Sider: React.FC = ({ children }) => {
    const versionList = Object.keys(reversion.versions).filter(v => !!whiteList.split(',').includes(v))
    const history = useHistory();
    const location = useLocation();

    const versionName = getVersionPage(location.pathname)?.version!
    const pageRoutes = reversion.versions[versionName]?.page;
    const anchorLinks = React.useRef<HTMLCollectionOf<Element>>(document.getElementsByClassName("heading-anchor-link"));
    const [loading, setLoading] = React.useState(true);
    const [showVersion, setShowVersion] = React.useState(false);

    const currentVersionItem = versionList.filter(v => getVersionPage(location.pathname)?.version === v)?.[0]

    React.useEffect(() => {
        const unlisten = history.listen(() => {
            // Scroll to the position under header to prevent side nav from resetting position
            window.scrollTo(0, 80);
        });
        return () => {
            unlisten();
        }
    }, []);

    React.useEffect(() => {
        if (loading) {
            formatPageRoutes(getVersionPage(location.pathname)?.version!, getVersionPage(location.pathname)?.uid!, reversion.versions[getVersionPage()?.version!]?.page)
            setLoading(false)
        }
    }, [loading])

    return (
        <div
          className="main-container"
          style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
          }}>
            <div
              className="left-gray-bg"
              style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: "calc((100% - 1560px) / 2)",
                  backgroundColor: "#F5F7F9",
                  zIndex: -1
              }}
            />

            <div
              className="main"
              style={{
                  display: "flex",
                  height: "100%",
                  width: "100%",
                  maxWidth: "1560px",
                  margin: "0 auto",
              }}
            >
                <div
                  className="side-nav"
                  style={styles.stickyColWrapper}
                >
                    <div style={{
                        ...styles.stickyColWithoutScrollbar,
                        maxHeight: "calc(100vh - 20px)", // minus the top padding 20px
                        paddingTop: "20px",
                        backgroundColor: "#F5F7F9",
                        borderRight: "1px solid #E6ECF1"
                    }}>
                        <GroupLayoutUI title={"versions"}>
                            <IndentLayout>
                                {
                                    !!currentVersionItem && <SiderItemRenderUI
                                      onPress={() => setShowVersion(!showVersion)}
                                      title={currentVersionItem}
                                      path={""}
                                      kind={""}
                                      href={""}
                                      onSelected={false}
                                      hasChildren={true}
                                      onOpen={showVersion}
                                    />
                                }
                                {
                                    showVersion && versionList.map((v, idx) => {
                                        return <SiderItemRenderUI
                                          key={idx}
                                          title={v}
                                          path={`/${v}/${reversion.versions[v]?.page?.uid}`}
                                          kind={reversion.versions[v]?.page?.kind}
                                          href={reversion.versions[v]?.page?.href}
                                          onSelected={getVersionPage(location.pathname)?.version === v}
                                        />
                                    })
                                }
                            </IndentLayout>
                        </GroupLayoutUI>
                        {/* document index */}
                        <IndentLayout>
                            <SiderItemRenderUI
                              kind={pageRoutes?.kind}
                              href={pageRoutes?.href}
                              title={pageRoutes?.title}
                              path={`/${pageRoutes?.uid}`}
                            />
                        </IndentLayout>
                        {renderSider(pageRoutes?.pages)}
                    </div>
                </div>

                <div
                  className="content"
                  style={{
                      flex: 1
                  }}
                >
                    {children}
                </div>

                <div
                  className="table-of-content"
                  style={styles.stickyColWrapper}
                >
                    <div style={{
                        ...styles.stickyColWithoutScrollbar,
                        maxHeight: "calc(100vh - 40px)", // minus the top padding 40px
                        paddingTop: "40px",
                        borderLeft: "1px solid #E6ECF1",
                    }}>
                        {
                            Array.from(anchorLinks.current).map(ele => {
                                const level = (ele as any).dataset.level
                                const href = `#${(ele.textContent || "").toLowerCase().replace(/\s+|\./g, "_")}`
                                const onSelect = location.hash === href
                                switch (level) {
                                    case 'one':
                                        return <OnHover>
                                            {(isEnter: boolean) => {
                                                return <div style={{ marginBottom: "8px", padding: onSelect ? "4px 16px 4px 22px" : "4px 16px 4px 24px", borderLeft: onSelect ? "2px solid rgb(252, 108, 4)" : "none", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                                                    <a href={href} style={{ color: (isEnter || onSelect) ? "rgb(252, 108, 4)" : "rgb(116, 129, 141)", textDecoration: "none", fontSize: '15px', lineHeight: "15px" }}>
                                                        {ele.textContent}
                                                    </a>
                                                </div>
                                            }}
                                        </OnHover>
                                    case 'two':
                                        return <OnHover>
                                            {(isEnter: boolean) => {
                                                return <div style={{ marginBottom: "8px", padding: onSelect ? "4px 16px 4px 38px" : "4px 16px 4px 40px", borderLeft: onSelect ? "2px solid rgb(252, 108, 4)" : "none", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                                                    <a href={href} style={{ color: (isEnter || onSelect) ? "rgb(252, 108, 4)" : "rgb(116, 129, 141)", textDecoration: "none", fontSize: '12px', lineHeight: "18px" }}>
                                                        {ele.textContent}
                                                    </a>
                                                </div>
                                            }}
                                        </OnHover>
                                    default:
                                        return null
                                }
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

const renderSider = (pages: Pages = [], isSub?: boolean) => {
    return pages.map((page, idx) => {
        const content = isSub ? <SiderItem key={page.uid} page={page} itemStyle={{ color: "rgba(157,170,182,0.8)", marginLeft: "-1px" }} />
            : <IndentLayout key={page.uid} ><SiderItem page={page} /></IndentLayout>
        if (page.kind === 'group') {
            return <GroupLayout page={page} key={page.uid}>
                {renderSider(page.pages)}
            </GroupLayout>
        }
        return content
    })
}

const GroupLayout: React.FC<{ page: VersionInfo }> = ({ page, children }) => {
    return <GroupLayoutUI title={page.title} style={{ marginTop: "30px" }}>
        {children}
    </GroupLayoutUI>
}

const GroupLayoutUI: React.FC<{ title: string; style?: React.CSSProperties }> = ({ title, children, style = {} }) => {
    return <IndentLayout style={style}>
        <IndentLayout>
            <div style={{ fontWeight: 700, lineHeight: 1.2, fontSize: "12px", letterSpacing: "1.2px", fontFamily: "Content-font, Roboto, sans-serif", color: "rgba(157,170,182,0.8)" }}>
                {String(title).toLocaleUpperCase()}
            </div>
        </IndentLayout>
        {children}
    </IndentLayout>
}

const SiderItem: React.FC<{ page: VersionInfo, itemStyle?: React.CSSProperties }> = ({ page, itemStyle = {} }) => {
    const location = useLocation();
    const pageInfo = getPageInfo(getVersionPage(location.pathname)?.version!, getVersionPage(location.pathname)?.uid!, page) || {}
    return <div>
        <SiderItemRenderUI kind={page?.kind} href={page?.href} title={page?.title} path={page?.uid} itemStyle={itemStyle} {...pageInfo} />
        {
            pageInfo?.onOpen && <IndentLayout style={{ paddingTop: 0 }}>
                <div style={{ borderLeft: "1px solid rgb(230, 236, 241)" }}>
                    {renderSider(page.pages, true)}
                </div>
            </IndentLayout>
        }
    </div>
}

const SiderItemRenderUI: React.FC<{
    title: string;
    path: string;
    kind: string;
    href: string;
    itemStyle?: React.CSSProperties;
    hasChildren?: boolean;
    onOpen?: boolean;
    onSelected?: boolean;
    onPress?: () => void;
}> = ({ title, onPress, path = "", kind, href, onSelected: _onSelected, hasChildren, onOpen, itemStyle = {} }) => {
    const history = useHistory();
    const location = useLocation();

    const targetPath = () => {
        if (!path) {
            return ""
        }
        const targetPathArgs = (path?.split("/") || []).filter(p => !!p)
        if (targetPathArgs.length === 1) {
            const basePath = (location.pathname?.split("/") || []).slice(0, -1).join("/")
            const [page] = targetPathArgs
            return `${basePath}/${page}`
        }
        if (targetPathArgs.length === 2) {
            const basePath = (location.pathname?.split("/") || []).slice(0, -2).join("/")
            const [version, page] = targetPathArgs
            return `${basePath}/${version}/${page}`
        }
        return ""
    }

    const onSelect = location.pathname === targetPath()

    const onSelectStyle: React.CSSProperties = (_onSelected || onSelect) ? {
        border: "1px solid #E6ECF1",
        borderRight: "none",
        backgroundColor: "white",
        color: "#FC6C04"
    } : {}


    return <OnHover onPress={() => {
        if (onPress) {
            onPress()
            return;
        }
        if (kind === 'link') {
            window.open(href)
        }
        const p = targetPath()
        !!p && history.push(p)
    }}>
        {onHover => {
            return <div style={{
                cursor: "pointer",
                fontSize: "14px",
                fontFamily: "Content-font, Roboto, sans-serif",
                ...itemStyle,
                ...onSelectStyle,
                ...onHover && !onSelect ? { backgroundColor: "#e2e9ef" } : {}
            }}>
                <IndentLayout style={{ padding: "8px 0px 8px 16px" }}>
                    {
                        hasChildren ? <div style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingRight: "24px"
                        }}>
                            {title}
                            {
                                onOpen ? <DownOutlined style={{ color: "rgba(157,170,182,0.8)" }} />
                                    : <RightOutlined style={{ color: "rgba(157,170,182,0.8)" }} />
                            }
                        </div> : title
                    }
                </IndentLayout>
            </div>
        }}
    </OnHover>
}

const IndentLayout: React.FC<{ style?: React.CSSProperties }> = ({ children, style = {} }) => {
    return <div style={{ padding: "4px 0px 4px 16px", ...style }}>{children}</div>
}