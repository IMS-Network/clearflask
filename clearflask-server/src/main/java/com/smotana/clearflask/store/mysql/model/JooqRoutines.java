/*
 * This file is generated by jOOQ.
 */
package com.smotana.clearflask.store.mysql.model;


import com.smotana.clearflask.store.mysql.model.routines.JooqExpDecay;
import com.smotana.clearflask.store.mysql.model.routines.JooqVoteWilson;

import javax.annotation.processing.Generated;

import org.jooq.Configuration;
import org.jooq.Field;


/**
 * Convenience access to all stored procedures and functions in the default
 * schema.
 */
@Generated(
    value = {
        "https://www.jooq.org",
        "jOOQ version:3.16.10"
    },
    comments = "This class is generated by jOOQ"
)
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class JooqRoutines {

    /**
     * Call <code>exp_decay</code>
     */
    public static Double expDecay(
          Configuration configuration
        , Double prevtrendscore
        , Long decayperiodinmillis
        , Long timeinmillis
    ) {
        JooqExpDecay f = new JooqExpDecay();
        f.setPrevtrendscore(prevtrendscore);
        f.setDecayperiodinmillis(decayperiodinmillis);
        f.setTimeinmillis(timeinmillis);

        f.execute(configuration);
        return f.getReturnValue();
    }

    /**
     * Get <code>exp_decay</code> as a field.
     */
    public static Field<Double> expDecay(
          Double prevtrendscore
        , Long decayperiodinmillis
        , Long timeinmillis
    ) {
        JooqExpDecay f = new JooqExpDecay();
        f.setPrevtrendscore(prevtrendscore);
        f.setDecayperiodinmillis(decayperiodinmillis);
        f.setTimeinmillis(timeinmillis);

        return f.asField();
    }

    /**
     * Get <code>exp_decay</code> as a field.
     */
    public static Field<Double> expDecay(
          Field<Double> prevtrendscore
        , Field<Long> decayperiodinmillis
        , Field<Long> timeinmillis
    ) {
        JooqExpDecay f = new JooqExpDecay();
        f.setPrevtrendscore(prevtrendscore);
        f.setDecayperiodinmillis(decayperiodinmillis);
        f.setTimeinmillis(timeinmillis);

        return f.asField();
    }

    /**
     * Call <code>vote_wilson</code>
     */
    public static Double voteWilson(
          Configuration configuration
        , Long upvotes
        , Long downvotes
        , Double z
        , Double zsquared
    ) {
        JooqVoteWilson f = new JooqVoteWilson();
        f.setUpvotes(upvotes);
        f.setDownvotes(downvotes);
        f.setZ(z);
        f.setZsquared(zsquared);

        f.execute(configuration);
        return f.getReturnValue();
    }

    /**
     * Get <code>vote_wilson</code> as a field.
     */
    public static Field<Double> voteWilson(
          Long upvotes
        , Long downvotes
        , Double z
        , Double zsquared
    ) {
        JooqVoteWilson f = new JooqVoteWilson();
        f.setUpvotes(upvotes);
        f.setDownvotes(downvotes);
        f.setZ(z);
        f.setZsquared(zsquared);

        return f.asField();
    }

    /**
     * Get <code>vote_wilson</code> as a field.
     */
    public static Field<Double> voteWilson(
          Field<Long> upvotes
        , Field<Long> downvotes
        , Field<Double> z
        , Field<Double> zsquared
    ) {
        JooqVoteWilson f = new JooqVoteWilson();
        f.setUpvotes(upvotes);
        f.setDownvotes(downvotes);
        f.setZ(z);
        f.setZsquared(zsquared);

        return f.asField();
    }
}