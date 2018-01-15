import CircleChevronLeft from '@sourcegraph/icons/lib/CircleChevronLeft'
import * as H from 'history'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { Observable } from 'rxjs/Observable'
import { map } from 'rxjs/operators/map'
import { gql, queryGraphQL } from '../backend/graphql'
import { displayRepoPath } from '../components/Breadcrumb'
import { FilteredConnection, FilteredConnectionQueryArgs } from '../components/FilteredConnection'
import { eventLogger } from '../tracking/eventLogger'

function fetchRepositories(args: { first?: number; query?: string }): Observable<GQL.IRepositoryConnection> {
    return queryGraphQL(
        gql`
            query Repositories($first: Int, $query: String) {
                site {
                    repositories(first: $first, query: $query) {
                        nodes {
                            id
                            uri
                        }
                        totalCount
                        pageInfo {
                            hasNextPage
                        }
                    }
                }
            }
        `,
        args
    ).pipe(
        map(({ data, errors }) => {
            if (!data || !data.site || !data.site.repositories) {
                throw Object.assign(new Error((errors || []).map(e => e.message).join('\n')), { errors })
            }
            return data.site.repositories
        })
    )
}

interface RepositoryNodeProps {
    node: GQL.IRepository
    currentRepo?: GQLID
}

export const RepositoryNode: React.SFC<RepositoryNodeProps> = ({ node, currentRepo }) => (
    <li key={node.id} className="popover__node">
        <Link
            to={`/${node.uri}`}
            className={`popover__node-link ${node.id === currentRepo ? 'popover__node-link--active' : ''}`}
        >
            {displayRepoPath(node.uri)}
            {node.id === currentRepo && <CircleChevronLeft className="icon-inline popover__node-link-icon" />}
        </Link>
    </li>
)

interface Props {
    /**
     * The current repository (shown as selected in the list), if any.
     */
    currentRepo?: GQLID

    history: H.History
    location: H.Location
}

/**
 * A popover that displays a searchable list of repositories.
 */
export class RepositoriesPopover extends React.PureComponent<Props> {
    public componentDidMount(): void {
        eventLogger.logViewEvent('RepositoriesPopover')
    }

    public render(): JSX.Element | null {
        const nodeProps: Pick<RepositoryNodeProps, 'currentRepo'> = { currentRepo: this.props.currentRepo }

        return (
            <div className="repositories-popover popover">
                <FilteredConnection
                    className="popover__content"
                    compact={true}
                    noun="repository"
                    pluralNoun="repositories"
                    queryConnection={this.queryRepositories}
                    nodeComponent={RepositoryNode}
                    nodeComponentProps={nodeProps}
                    defaultFirst={10}
                    autoFocus={true}
                    history={this.props.history}
                    location={this.props.location}
                    noUpdateURLQuery={true}
                    noSummaryIfAllNodesVisible={true}
                />
            </div>
        )
    }

    private queryRepositories = (args: FilteredConnectionQueryArgs) => fetchRepositories({ ...args })
}
