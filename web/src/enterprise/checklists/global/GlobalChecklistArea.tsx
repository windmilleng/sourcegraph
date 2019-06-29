import { ChecklistScope } from '@sourcegraph/extension-api-classes'
import MapSearchIcon from 'mdi-react/MapSearchIcon'
import React from 'react'
import { Route, RouteComponentProps, Switch } from 'react-router'
import { ExtensionsControllerProps } from '../../../../../shared/src/extensions/controller'
import * as GQL from '../../../../../shared/src/graphql/schema'
import { PlatformContextProps } from '../../../../../shared/src/platform/context'
import { HeroPage } from '../../../components/HeroPage'
import { ChecklistIcon } from '../../../util/octicons'
import { ChecklistArea } from '../detail/ChecklistArea'

const NotFoundPage: React.FunctionComponent = () => (
    <HeroPage icon={MapSearchIcon} title="404: Not Found" subtitle={`Sorry, the requested page was not found.`} />
)

interface Props extends ExtensionsControllerProps, PlatformContextProps, RouteComponentProps<{}> {
    authenticatedUser: GQL.IUser | null
    isLightTheme: boolean
}

/**
 * The global checklist area.
 */
export const GlobalChecklistArea: React.FunctionComponent<Props> = ({ match, ...props }) => (
    <div className="w-100">
        <div className="container-fluid my-3">
            <h1 className="h3 mb-0 d-flex align-items-center">
                <ChecklistIcon className="icon-inline mr-1" /> Checklist
            </h1>
        </div>
        <Switch>
            <Route
                path={match.url}
                exact={true}
                // tslint:disable-next-line:jsx-no-lambda
                render={routeComponentProps => (
                    <ChecklistArea {...props} {...routeComponentProps} scope={ChecklistScope.Global} />
                )}
            />
            <Route key="hardcoded-key" component={NotFoundPage} />
        </Switch>
    </div>
)