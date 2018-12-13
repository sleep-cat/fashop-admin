import React, { Component } from "react";
import { View } from "react-web-dom";
import Page from '@/components/public/page'
import styles from '../../styles/order/refundEdit.css'
import RefundDetail from "@/components/order/refundDetail";
import { publicFunction } from "@/utils";
const { parseQuery } = publicFunction
export default class RefundEdit extends Component {
    render() {
        const { location, history } = this.props
        const { id } = parseQuery(location.search)

        return (
            <View className={`${styles.refundEditWarp} refundEdit`}>
                <Page>
                    <RefundDetail
                        id={id}
                        history={history}
                        location={location}
                    />
                </Page>
            </View>
        )
    }
}