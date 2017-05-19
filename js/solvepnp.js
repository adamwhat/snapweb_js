/**
 * Created by adamwang on 5/17/17.
 */

function getMatElement(m, x, y, size) {
    return m[x + y*size];
}

function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

function PnPSolver(_fx, _fy, _cx, _cy) {

    var fx = _fx;
    var fy = _fy;
    var cx = _cx;
    var cy = _cy;
    var inv_fx = 1.0 / fx;
    var inv_fy = 1.0 / fy;
    var cx_fx = cx / fx;
    var cy_fy = cy / fy;

    function solvePnP(objPoints, imgPoints) {
        /*
         objPoints: 4 * 3 matrix
         imgPoints: 4 * 2 matrix
         */

        var rvec = vec3.create();
        var tvec = vec3.create();


        // console.log(objPoints);
        assert(objPoints.length == 4);
        assert(imgPoints.length == 4);
        assert(imgPoints.length == objPoints.length);

        return solve4(
            imgPoints[0][0],
            imgPoints[0][1],
            objPoints[0][0],
            objPoints[0][1],
            objPoints[0][2],
            imgPoints[1][0],
            imgPoints[1][1],
            objPoints[1][0],
            objPoints[1][1],
            objPoints[1][2],
            imgPoints[2][0],
            imgPoints[2][1],
            objPoints[2][0],
            objPoints[2][1],
            objPoints[2][2],
            imgPoints[3][0],
            imgPoints[3][1],
            objPoints[3][0],
            objPoints[3][1],
            objPoints[3][2]
        );
    };

    function solve4(mu0, mv0, x0, y0, z0,
        mu1, mv1, x1, y1, z1,
        mu2, mv2, x2, y2, z2,
        mu3, mv3, x3, y3, z3) {

        // rs: array of matrix 3x3, ts: array of vec3
        var n, rs = Array(4), ts = Array(4);
        [n, rs, ts] = solve3(mu0, mv0, x0, y0, z0,
            mu1, mv1, x1, y1, z1,
            mu2, mv2, x2, y2, z2);

        if (n === 0) {
            return false;
        }

        var ns = 0, min_reproj = 0.0;
        for (var i = 0; i < n; i++) {
            var x3p = getMatElement(rs[i], 0, 0, 3) * x3 + getMatElement(rs[i], 0, 1, 3) * y3 + getMatElement(rs[i], 0, 2, 3) * z3 + ts[i][0];
            var y3p = getMatElement(rs[i], 1, 0, 3) * x3 + getMatElement(rs[i], 1, 1, 3) * y3 + getMatElement(rs[i], 1, 2, 3) * z3 + ts[i][1];
            var z3p = getMatElement(rs[i], 2, 0, 3) * x3 + getMatElement(rs[i], 2, 1, 3) * y3 + getMatElement(rs[i], 2, 2, 3) * z3 + ts[i][2];
            var mu3p = cx + fx * x3p / z3p;
            var mv3p = cy + fy * y3p / z3p;
            var reproj = (mu3p - mu3) * (mu3p - mu3) + (mv3p - mv3) * (mv3p - mv3);

            if (i === 0 || min_reproj > reproj) {
                ns = i;
                min_reproj = reproj;
            }
        }

        var rotate = mat3.clone(rs[ns]);
        var translate = vec3.clone(ts[ns]);

        // for(var i = 0; i < 9; i++) {
        //     rotate[i] = rs[ns][i];
        // }

        // for (var i = 0; i < 3; i++) {
        //     translate[i] = ts[ns][i];
        // }
        return {
            "rotation": rotate,
            "translation": translate
        }
    };

    function solve3(mu0, mv0, X0, Y0, Z0,
        mu1, mv1, X1, Y1, Z1,
        mu2, mv2, X2, Y2, Z2) {

        var mk0, mk1, mk2, norm;

        mu0 = inv_fx * mu0 - cx_fx;
        mv0 = inv_fy * mv0 - cy_fy;
        norm = Math.sqrt(mu0 * mu0 + mv0 * mv0 + 1.0);
        mk0 = 1.0 / norm; mu0 *= mk0; mv0 *= mk0;

        mu1 = inv_fx * mu1 - cx_fx;
        mv1 = inv_fy * mv1 - cy_fy;
        norm = Math.sqrt(mu1 * mu1 + mv1 * mv1 + 1);
        mk1 = 1.0 / norm; mu1 *= mk1; mv1 *= mk1;

        mu2 = inv_fx * mu2 - cx_fx;
        mv2 = inv_fy * mv2 - cy_fy;
        norm = Math.sqrt(mu2 * mu2 + mv2 * mv2 + 1);
        mk2 = 1.0 / norm; mu2 *= mk2; mv2 *= mk2;

        var distances = Array(3);
        distances[0] = Math.sqrt((X1 - X2) * (X1 - X2) + (Y1 - Y2) * (Y1 - Y2) + (Z1 - Z2) * (Z1 - Z2));
        distances[1] = Math.sqrt((X0 - X2) * (X0 - X2) + (Y0 - Y2) * (Y0 - Y2) + (Z0 - Z2) * (Z0 - Z2));
        distances[2] = Math.sqrt((X0 - X1) * (X0 - X1) + (Y0 - Y1) * (Y0 - Y1) + (Z0 - Z1) * (Z0 - Z1));

        // Calculate angles
        var cosines = Array(3);
        cosines[0] = mu1 * mu2 + mv1 * mv2 + mk1 * mk2;
        cosines[1] = mu0 * mu2 + mv0 * mv2 + mk0 * mk2;
        cosines[2] = mu0 * mu1 + mv0 * mv1 + mk0 * mk1;

        // length is Array(vec3 * 4, len = 4)
        var n, lengths = Array(4);
        [n, lengths] = solve_for_lengths(distances, cosines);

        // console.log("nbsol", n);
        // console.log("lenghts", lengths);

        var nb_solutions = 0;
        // resultR 4 * 3 * 3 (4 * mat3), resultT 4 * 3 (4 * mat3)
        var resultR = Array(4), resultT = Array(4);

        for (var i = 0; i < n; i++) {
            // 3 * 3 matrix
            var M_orig = mat3.create();

            mat3.set(M_orig,
                lengths[i][0] * mu0,
                lengths[i][1] * mu1,
                lengths[i][2] * mu2,

                lengths[i][0] * mv0,
                lengths[i][1] * mv1,
                lengths[i][2] * mv2,

                lengths[i][0] * mk0,
                lengths[i][1] * mk1,
                lengths[i][2] * mk2
            );

            var outR = mat3.create(), outT = vec3.create(), res;
            // Always return true
            [res, outR, outT] = align(M_orig, X0, Y0, Z0, X1, Y1, Z1, X2, Y2, Z2);

            // TODO: assign value to resultRT should be above this if?
            if (res === false) {
                continue;
            }

            resultR[nb_solutions] = outR;
            resultT[nb_solutions] = outT;
            nb_solutions++;
        }

        return [nb_solutions, resultR, resultT];
    };

    // distances[3], cosines[3]
    // return legnths[4][3]: vec3[4]
    function solve_for_lengths(distances, cosines) {
        var p = cosines[0] * 2;
        var q = cosines[1] * 2;
        var r = cosines[2] * 2;

        var inv_d22 = 1. / (distances[2] * distances[2]);
        var a = inv_d22 * (distances[0] * distances[0]);
        var b = inv_d22 * (distances[1] * distances[1]);

        var a2 = a * a, b2 = b * b, p2 = p * p, q2 = q * q, r2 = r * r;
        var pr = p * r, pqr = q * pr;

        // Check reality condition (the four points should not be coplanar)
        if (p2 + q2 + r2 - pqr - 1 == 0)
            return [0, null];

        var ab = a * b, a_2 = 2 * a;

        var A = -2 * b + b2 + a2 + 1 + ab * (2 - r2) - a_2;

        // Check reality condition
        if (A == 0) return [0, null];

        var a_4 = 4 * a;

        var B = q * (-2 * (ab + a2 + 1 - b) + r2 * ab + a_4) + pr * (b - b2 + ab);
        var C = q2 + b2 * (r2 + p2 - 2) - b * (p2 + pqr) - ab * (r2 + pqr) + (a2 - a_2) * (2 + q2) + 2;
        var D = pr * (ab - b2 + b) + q * ((p2 - 2) * b + 2 * (ab - a2) + a_4 - 2);
        var E = 1 + 2 * (b - a - ab) + b2 - b * p2 + a2;

        var temp = (p2 * (a - 1 + b) + r2 * (a - 1 - b) + pqr - a * pqr);
        var b0 = b * temp * temp;
        // Check reality condition
        if (b0 == 0)
            return [0, null];

        var real_roots = Array(4);
        var n, real_roots;
        [n, real_roots] = solve_deg4(A, B, C, D, E);

        if (n == 0)
            return [0, null];

        var nb_solutions = 0;
        var r3 = r2 * r, pr2 = p * r2, r3q = r3 * q;
        var inv_b0 = 1. / b0;

        // vec3[4]
        var lengths = Array(4);

        // For each solution of x
        for (var i = 0; i < n; i++) {
            var x = real_roots[i];

            // Check reality condition
            if (x <= 0)
                continue;

            var x2 = x * x;

            var b1 =
                ((1 - a - b) * x2 + (q * a - q) * x + 1 - a + b) *
                (((r3 * (a2 + ab * (2 - r2) - a_2 + b2 - 2 * b + 1)) * x +

                    (r3q * (2 * (b - a2) + a_4 + ab * (r2 - 2) - 2) + pr2 * (1 + a2 + 2 * (ab - a - b) + r2 * (b - b2) + b2))) * x2 +

                    (r3 * (q2 * (1 - 2 * a + a2) + r2 * (b2 - ab) - a_4 + 2 * (a2 - b2) + 2) + r * p2 * (b2 + 2 * (ab - b - a) + 1 + a2) + pr2 * q * (a_4 + 2 * (b - ab - a2) - 2 - r2 * b)) * x +

                    2 * r3q * (a_2 - b - a2 + ab - 1) + pr2 * (q2 - a_4 + 2 * (a2 - b2) + r2 * b + q2 * (a2 - a_2) + 2) +
                    p2 * (p * (2 * (ab - a - b) + a2 + b2 + 1) + 2 * q * r * (b + a_2 - a2 - ab - 1)));

            // Check reality condition
            if (b1 <= 0)
                continue;

            var y = inv_b0 * b1;
            var v = x2 + y * y - x * y * r;

            if (v <= 0)
                continue;

            var Z = distances[2] / Math.sqrt(v);
            var X = x * Z;
            var Y = y * Z;

            lengths[nb_solutions] = vec3.create();
            lengths[nb_solutions][0] = X;
            lengths[nb_solutions][1] = Y;
            lengths[nb_solutions][2] = Z;

            nb_solutions++;
        }

        return [nb_solutions, lengths];
    };

    // M_end: mat3
    function align(M_end, X0, Y0, Z0, X1, Y1, Z1, X2, Y2, Z2) {

        // Centroids:
        var C_start = vec3.create(), C_end = vec3.create();
        for (var i = 0; i < 3; i++) {
            C_end[i] = (getMatElement(M_end, 0, i, 3) + getMatElement(M_end, 1, i, 3) + getMatElement(M_end, 2, i, 3)) / 3.0;
        }

        C_start[0] = (X0 + X1 + X2) / 3.0;
        C_start[1] = (Y0 + Y1 + Y2) / 3.0;
        C_start[2] = (Z0 + Z1 + Z2) / 3.0;

        // Covariance matrix s: mat3
        var s = Array(9);
        for (var j = 0; j < 3; j++) {
            s[0 * 3 + j] = (X0 * getMatElement(M_end, 0, j, 3) + X1 * getMatElement(M_end, 1, j, 3) + X2 * getMatElement(M_end, 2, j, 3)) / 3.0 - C_end[j] * C_start[0];
            s[1 * 3 + j] = (Y0 * getMatElement(M_end, 0, j, 3) + Y1 * getMatElement(M_end, 1, j, 3) + Y2 * getMatElement(M_end, 2, j, 3)) / 3.0 - C_end[j] * C_start[1];
            s[2 * 3 + j] = (Z0 * getMatElement(M_end, 0, j, 3) + Z1 * getMatElement(M_end, 1, j, 3) + Z2 * getMatElement(M_end, 2, j, 3)) / 3.0 - C_end[j] * C_start[2];
        }

        // var Qs = [[0, 0, 0, 0],
        // [0, 0, 0, 0],
        // [0, 0, 0, 0],
        // [0, 0, 0, 0]];
        // var Qs = new jsfeat.matrix_t(4, 4, jsfeat.F32_t | jsfeat.C1_t);
        // var W = new jsfeat.matrix_t(1, 4, jsfeat.F32_t | jsfeat.C1_t);
        // var U = new jsfeat.matrix_t(4, 4, jsfeat.F32_t | jsfeat.C1_t);
        // var V = new jsfeat.matrix_t(4, 4, jsfeat.F32_t | jsfeat.C1_t);

        // Qs = Array(16), evs0 =  = Array(4), U0 = Array(16);
        var Qs = Array(16);

        Qs[0 * 4 + 0] = s[0 * 3 + 0] + s[1 * 3 + 1] + s[2 * 3 + 2];
        Qs[1 * 4 + 1] = s[0 * 3 + 0] - s[1 * 3 + 1] - s[2 * 3 + 2];
        Qs[2 * 4 + 2] = s[1 * 3 + 1] - s[2 * 3 + 2] - s[0 * 3 + 0];
        Qs[3 * 4 + 3] = s[2 * 3 + 2] - s[0 * 3 + 0] - s[1 * 3 + 1];

        // Qs[0][0] = s[0 * 3 + 0] + s[1 * 3 + 1] + s[2 * 3 + 2];
        // Qs[1][1] = s[0 * 3 + 0] - s[1 * 3 + 1] - s[2 * 3 + 2];
        // Qs[2][2] = s[1 * 3 + 1] - s[2 * 3 + 2] - s[0 * 3 + 0];
        // Qs[3][3] = s[2 * 3 + 2] - s[0 * 3 + 0] - s[1 * 3 + 1];

        Qs[1 * 4 + 0] = s[1 * 3 + 2] - s[2 * 3 + 1];
        Qs[2 * 4 + 0] = s[2 * 3 + 0] - s[0 * 3 + 2];
        Qs[3 * 4 + 0] = s[0 * 3 + 1] - s[1 * 3 + 0];
        Qs[2 * 4 + 1] = s[1 * 3 + 0] + s[0 * 3 + 1];
        Qs[3 * 4 + 1] = s[2 * 3 + 0] + s[0 * 3 + 2];
        Qs[3 * 4 + 2] = s[2 * 3 + 1] + s[1 * 3 + 2];
        Qs[0 * 4 + 1] = Qs[1 * 4 + 0];
        Qs[0 * 4 + 2] = Qs[2 * 4 + 0];
        Qs[0 * 4 + 3] = Qs[3 * 4 + 0];
        Qs[1 * 4 + 2] = Qs[2 * 4 + 1];
        Qs[1 * 4 + 3] = Qs[3 * 4 + 1];
        Qs[2 * 4 + 3] = Qs[3 * 4 + 2];

        // Qs[1][0] = s[1 * 3 + 2] - s[2 * 3 + 1];
        // Qs[2][0] = s[2 * 3 + 0] - s[0 * 3 + 2];
        // Qs[3][0] = s[0 * 3 + 1] - s[1 * 3 + 0];
        // Qs[2][1] = s[1 * 3 + 0] + s[0 * 3 + 1];
        // Qs[3][1] = s[2 * 3 + 0] + s[0 * 3 + 2];
        // Qs[3][2] = s[2 * 3 + 1] + s[1 * 3 + 2];
        // Qs[0][1] = Qs[1][0];
        // Qs[0][2] = Qs[2][0];
        // Qs[0][3] = Qs[3][0];
        // Qs[1][2] = Qs[2][1];
        // Qs[1][3] = Qs[3][1];
        // Qs[2][3] = Qs[3][2];


        // jsfeat.linalg.svd_decompose(Qs, W, U, V);
        var evs, U;
        [evs, U] = jacobi_4x4(Qs);

        // var evs = [], U = [];
        // var lambda = result.lambda.x;
        // var E = result.E.x;
        // var egvec = [];
        // evs.push(lambda[0]);
        // egvec.push([E[0][0], E[1][0], E[2][0], E[3][0]]);
        // for (var i = 1; i < 4; i++) {
        //     var isInsert = false;
        //     for (var j = 0; j < evs.length; j++) {
        //         if (lambda[i] > evs[j]) {
        //             evs.splice(j, 0, lambda[i]);
        //             if (lambda[i] >= 0) {
        //                 egvec.splice(j, 0, [E[0][i], E[1][i], E[2][i], E[3][i]]);
        //             }
        //             else {
        //                 egvec.splice(j, 0, [-E[0][i], -E[1][i], -E[2][i], -E[3][i]])
        //             }
        //             isInsert = true;
        //             break;
        //         }
        //     }
        //     if (!isInsert) {
        //         evs.push(lambda[i]);
        //         if (lambda[i] >= 0) {
        //             egvec.splice(j, 0, [E[0][i], E[1][i], E[2][i], E[3][i]]);
        //         }
        //         else {
        //             egvec.splice(j, 0, [-E[0][i], -E[1][i], -E[2][i], -E[3][i]])
        //         }
        //     }
        // }

        // for (var i = 0; i < 4; i++) {
        //     for (var j = 0; j < 4; j++) {
        //         U.push(egvec[j][i]);
        //     }
        // }


        // var evs = W.data;
        // Looking for the largest eigen value:
        var i_ev = 0;
        var ev_max = evs[i_ev];
        for (var i = 1; i < 4; i++) {
            if (evs[i] > ev_max) {
                ev_max = evs[i_ev = i];
            }
        }

        // Quaternion:
        var q = Array(4);
        for (var i = 0; i < 4; i++)
            q[i] = U[i * 4 + i_ev];

        var q02 = q[0] * q[0], q12 = q[1] * q[1], q22 = q[2] * q[2], q32 = q[3] * q[3];
        var q0_1 = q[0] * q[1], q0_2 = q[0] * q[2], q0_3 = q[0] * q[3];
        var q1_2 = q[1] * q[2], q1_3 = q[1] * q[3];
        var q2_3 = q[2] * q[3];

        var R = mat3.create()
        // Already fix order problem here
        mat3.set(R,
            q02 + q12 - q22 - q32, 2. * (q1_2 + q0_3), 2. * (q1_3 - q0_2),
            2. * (q1_2 - q0_3), q02 + q22 - q12 - q32, 2. * (q2_3 + q0_1),
            2. * (q1_3 + q0_2), 2. * (q2_3 - q0_1), q02 + q32 - q12 - q22
        );
        // R[0][0] = q02 + q12 - q22 - q32;
        // R[0][1] = 2. * (q1_2 - q0_3);
        // R[0][2] = 2. * (q1_3 + q0_2);

        // R[1][0] = 2. * (q1_2 + q0_3);
        // R[1][1] = q02 + q22 - q12 - q32;
        // R[1][2] = 2. * (q2_3 - q0_1);

        // R[2][0] = 2. * (q1_3 - q0_2);
        // R[2][1] = 2. * (q2_3 + q0_1);
        // R[2][2] = q02 + q32 - q12 - q22;
        var T = vec3.create();

        for (var i = 0; i < 3; i++) {
            // T[i] = C_end[i] - (R[i][0] * C_start[0] + R[i][1] * C_start[1] + R[i][2] * C_start[2]);
            T[i] = C_end[i] - (getMatElement(R, i, 0, 3) * C_start[0] + getMatElement(R, i, 1, 3) * C_start[1] + getMatElement(R, i, 2, 3) * C_start[2]);
        }
        return [true, R, T]
    }

    // return n: number of real roots
    // return real_roots: Array(4)
    function solve_deg4(A, B, C, D, E) {
        var coefficients = [A, B, C, D, E];
        var roots = quartic(coefficients);
        var n = 0;
        var real_roots = Array(4);
        for (var i = 0; i < 4; i++) {
            if (Math.abs(roots[i].im - 0) < 0.000001) {
                real_roots[n] = roots[i].re;
                n++;
            }
        }
        return [n, real_roots];
    }

    function jacobi_4x4(A) {
        var D, U;
        var B = Array(4);
        var Id = [1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0];
        U = Id.slice(0);
        B[0] = A[0];
        B[1] = A[5];
        B[2] = A[10];
        B[3] = A[15];
        D = B.slice(0);
        var Z = [0.0, 0.0, 0.0, 0.0];

        for (var iter = 0; iter < 50; iter++) {
            var sum = Math.abs(A[1]) + Math.abs(A[2]) + Math.abs(A[3]) + Math.abs(A[6]) + Math.abs(A[7]) + Math.abs(A[11]);
            if (sum == 0.0) {
                return [D, U];
            }

            var tresh = (iter < 3) ? 0.2 * sum / 16.0 : 0.0;
            for (var i = 0; i < 3; i++) {
                var pAij = 0;
                for (var j = i + 1; j < 4; j++) {
                    var Aij = A[5 * i + 1 + pAij];
                    var eps_machine = 100.0 * Math.abs(Aij);

                    if (iter > 3 && Math.abs(D[i]) + eps_machine == Math.abs(D[i]) && Math.abs(D[j]) + eps_machine == Math.abs(D[j])) {
                        A[5 * i + 1 + pAij] = 0.0;
                    }
                    else if (Math.abs(Aij) > tresh) {
                        var hh = D[j] - D[i];
                        var t;
                        if (Math.abs(hh) + eps_machine == Math.abs(hh)) {
                            t = Aij / hh;
                        }
                        else {
                            var theta = 0.5 * hh / Aij;
                            t = 1.0 / (Math.abs(theta) + Math.sqrt(1.0 + theta * theta));
                            if (theta < 0.0) t = -t;
                        }

                        hh = t * Aij;
                        Z[i] -= hh;
                        Z[j] += hh;
                        D[i] -= hh;
                        D[j] += hh;
                        A[5 * i + 1 + pAij] = 0.0;

                        var c = 1.0 / Math.sqrt(1 + t * t);
                        var s = t * c;
                        var tau = s / (1.0 + c);

                        for (var k = 0; k <= i - 1; k++) {
                            var g = A[k * 4 + i];
                            var h = A[k * 4 + j];
                            A[k * 4 + i] = g - s * (h + g * tau);
                            A[k * 4 + j] = h + s * (g - h * tau);
                        }
                        for (var k = i + 1; k <= j - 1; k++) {
                            var g = A[i * 4 + k];
                            var h = A[k * 4 + j];
                            A[i * 4 + k] = g - s * (h + g * tau);
                            A[k * 4 + j] = h + s * (g - h * tau);
                        }
                        for (var k = j + 1; k < 4; k++) {
                            var g = A[i * 4 + k];
                            var h = A[j * 4 + k];
                            A[i * 4 + k] = g - s * (h + g * tau);
                            A[j * 4 + k] = h + s * (g - h * tau);
                        }
                        for (var k = 0; k < 4; k++) {
                            var g = U[k * 4 + i];
                            var h = U[k * 4 + j];
                            U[k * 4 + i] = g - s * (h + g * tau);
                            U[k * 4 + j] = h + s * (g - h * tau);
                        }
                    }
                    pAij++;
                }
            }

            for (var i = 0; i < 4; i++) {
                B[i] += Z[i];
            }
            D = B.slice(0);
            Z = [0,0,0,0];
        }

        return [D, U];
    }

    return {
        solvePnP: solvePnP
    }

}

